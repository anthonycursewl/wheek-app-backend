import {
    Controller,
    Get,
    Post,
    Query,
    Body,
    Param,
    Req,
    Inject,
    BadRequestException,
    NotFoundException,
    Logger,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public } from '@/src/common/decorators/public.decorator';
import { FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';

import { LookupUserUseCase } from '../../application/lookup-user.usecase';
import { ProvisionUserUseCase } from '../../application/provision-user.usecase';
import { GetUserStatusUseCase } from '../../application/user-status.usecase';
import { PartnerApiKeyGuard } from '../guards/partner-api-key.guard';

import { PARTNER_LINKED_USER_REPOSITORY, PartnerLinkedUserRepository } from '../../domain/repos/partner-linked-user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';
import type { UserRepository } from '@users/domain/repos/user.repository';

import {
    LookupUserQueryDto,
    ProvisionUserDto,
    LookupUserResponseDto,
    ProvisionUserResponseDto,
    UserStatusResponseDto,
} from '../dtos/partner.dto';

import {
    GetUserTokenDto,
    GetUserTokenResponseDto,
} from '../dtos/oauth-link.dto';

@ApiTags('partners')
@Controller('partners')
@UseGuards(PartnerApiKeyGuard)
@Public() // Bypass JWT guard, we use Partner API Key instead
@ApiHeader({ name: 'X-Partner-API-Key', required: true, description: 'Partner API Key' })
export class PartnerController {
    private readonly logger = new Logger(PartnerController.name);

    constructor(
        private readonly lookupUserUseCase: LookupUserUseCase,
        private readonly provisionUserUseCase: ProvisionUserUseCase,
        private readonly getUserStatusUseCase: GetUserStatusUseCase,
        @Inject(PARTNER_LINKED_USER_REPOSITORY)
        private readonly linkedUserRepository: PartnerLinkedUserRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Lookup user by email
     */
    @Get('users/lookup')
    @ApiOperation({ summary: 'Lookup user by email' })
    @ApiQuery({ name: 'email', required: true, description: 'Email to lookup' })
    @ApiResponse({ status: 200, description: 'User found', type: LookupUserResponseDto })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Invalid API key' })
    async lookupUser(
        @Query() query: LookupUserQueryDto,
        @Req() request: FastifyRequest,
    ): Promise<LookupUserResponseDto> {
        this.logger.debug(`User lookup request for email: ${query.email}`);

        const result = await this.lookupUserUseCase.execute({
            email: query.email,
        });

        if (!result.isSuccess) {
            const error = result.error.message;
            if (error.includes('user_not_found')) {
                throw new NotFoundException({
                    error: 'user_not_found',
                    message: error.includes(':') ? error.split(': ')[1] : error,
                });
            }
            throw new BadRequestException({
                error: error.split(':')[0] || 'server_error',
                message: error.includes(':') ? error.split(': ')[1] : error,
            });
        }

        return result.value;
    }

    /**
     * Provision (auto-create) a user
     */
    @Post('users/provision')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Provision (auto-create) a user' })
    @ApiResponse({ status: 201, description: 'User created', type: ProvisionUserResponseDto })
    @ApiResponse({ status: 200, description: 'User already exists', type: ProvisionUserResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 401, description: 'Invalid API key' })
    async provisionUser(
        @Body() body: ProvisionUserDto,
        @Req() request: FastifyRequest,
    ): Promise<ProvisionUserResponseDto> {
        this.logger.debug(`User provision request for email: ${body.email}`);

        const result = await this.provisionUserUseCase.execute({
            email: body.email,
            name: body.name,
            first_name: body.first_name,
            last_name: body.last_name,
            external_partner_id: body.external_partner_id,
            source: body.source || (request as any).partner?.nameValue || 'partner_api',
            auto_verify_email: body.auto_verify_email,
            send_welcome_email: body.send_welcome_email,
            metadata: body.metadata,
        });

        if (!result.isSuccess) {
            const error = result.error.message;
            throw new BadRequestException({
                error: error.split(':')[0] || 'provisioning_failed',
                message: error.includes(':') ? error.split(': ')[1] : error,
            });
        }

        return result.value;
    }

    /**
     * Get user status by ID
     */
    @Get('users/:id/status')
    @ApiOperation({ summary: 'Get user status' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User status', type: UserStatusResponseDto })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Invalid API key' })
    async getUserStatus(
        @Param('id') userId: string,
        @Req() request: FastifyRequest,
    ): Promise<UserStatusResponseDto> {
        this.logger.debug(`User status request for ID: ${userId}`);

        const result = await this.getUserStatusUseCase.execute(userId);

        if (!result.isSuccess) {
            const error = result.error.message;
            if (error.includes('user_not_found')) {
                throw new NotFoundException({
                    error: 'user_not_found',
                    message: error.includes(':') ? error.split(': ')[1] : error,
                });
            }
            throw new BadRequestException({
                error: error.split(':')[0] || 'server_error',
                message: error.includes(':') ? error.split(': ')[1] : error,
            });
        }

        return result.value;
    }

    /**
     * Get OAuth token for a linked user
     * This allows partners to get tokens for users that have gone through the linking flow
     */
    @Post('users/token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get OAuth token for a linked user' })
    @ApiResponse({ status: 200, description: 'Token issued', type: GetUserTokenResponseDto })
    @ApiResponse({ status: 404, description: 'User not linked' })
    @ApiResponse({ status: 401, description: 'Invalid API key' })
    async getUserToken(
        @Body() body: GetUserTokenDto,
        @Req() request: FastifyRequest,
    ): Promise<GetUserTokenResponseDto> {
        const partner = (request as any).partner;
        const partnerData = partner.toPrimitives();

        this.logger.debug(`Token request for external user: ${body.external_user_id}`);

        // 1. Find linked user
        const linkedUser = await this.linkedUserRepository.findByPartnerAndExternalUser(
            partnerData.id,
            body.external_user_id,
        );

        if (!linkedUser) {
            throw new NotFoundException({
                error: 'user_not_linked',
                error_description: 'No linked user found with this external_user_id. User must complete the linking flow first.',
            });
        }

        // 2. Verify user still exists
        const wheekUser = await this.userRepository.findById(linkedUser.wheekUserIdValue);
        if (!wheekUser) {
            throw new NotFoundException({
                error: 'user_not_found',
                error_description: 'Linked Wheek user no longer exists',
            });
        }

        // 3. Determine scopes
        const requestedScopes = body.scope?.split(' ') || partnerData.default_scopes || [];
        const defaultScopes = ['profile', 'stores:all', 'inventory:write', 'products:write', 'sales:write'];
        const scopes = requestedScopes.length > 0 ? requestedScopes : defaultScopes;

        // 4. Generate tokens
        const accessTokenPayload = {
            sub: linkedUser.wheekUserIdValue,
            type: 'access',
            scopes: scopes,
            partner_id: partnerData.id,
            external_user_id: body.external_user_id,
        };

        const refreshTokenPayload = {
            sub: linkedUser.wheekUserIdValue,
            type: 'refresh',
            partner_id: partnerData.id,
            external_user_id: body.external_user_id,
        };

        const accessToken = this.jwtService.sign(accessTokenPayload, {
            expiresIn: '1h',
            secret: process.env.JWT_ACCESS_SECRET,
        });

        const refreshToken = this.jwtService.sign(refreshTokenPayload, {
            expiresIn: '30d',
            secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET,
        });

        // 5. Update last token timestamp
        linkedUser.updateLastTokenAt();
        await this.linkedUserRepository.update(linkedUser);

        this.logger.debug(`Token issued for user: ${linkedUser.wheekUserIdValue}`);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: scopes.join(' '),
            wheek_user_id: linkedUser.wheekUserIdValue,
        };
    }
}


import {
    Controller,
    Get,
    Req,
    UnauthorizedException,
    Logger,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/src/common/decorators/public.decorator';
import { FastifyRequest } from 'fastify';

import { GetUserInfoUseCase } from '../../application/get-user-info.usecase';
import { OAuthScopeGuard, RequireScopes } from '../guards/oauth-scope.guard';

@ApiTags('oauth')
@Controller('v1')
export class UserInfoController {
    private readonly logger = new Logger(UserInfoController.name);

    constructor(
        private readonly getUserInfoUseCase: GetUserInfoUseCase,
    ) { }

    /**
     * Get current user information based on OAuth token
     */
    @Public() // Bypass JWT guard, we use OAuth token instead
    @UseGuards(OAuthScopeGuard)
    @RequireScopes('profile')
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user information' })
    @ApiResponse({
        status: 200,
        description: 'User information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                user_id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                display_name: { type: 'string' },
                avatar_url: { type: 'string', nullable: true },
                profile_image: { type: 'string', nullable: true },
                email_verified: { type: 'boolean' },
                username: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
                subscription: {
                    type: 'object',
                    properties: {
                        plan: { type: 'string' },
                        expires_at: { type: 'string', nullable: true },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Invalid or expired access token' })
    @ApiResponse({ status: 403, description: 'Insufficient scope' })
    async getCurrentUser(@Req() request: FastifyRequest) {
        this.logger.debug('User info request received');

        // Get access token from header
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'Missing Authorization header',
            });
        }

        const token = authHeader.replace('Bearer ', '');

        const result = await this.getUserInfoUseCase.execute(token);

        if (!result.isSuccess) {
            const error = result.error.message;
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: error.includes(':') ? error.split(': ')[1] : error,
            });
        }

        return result.value;
    }
}

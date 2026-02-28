import {
    Controller,
    Get,
    Post,
    Query,
    Body,
    Inject,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
    Logger,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/src/common/decorators/public.decorator';
import { FastifyReply } from 'fastify';
import * as crypto from 'crypto';

import { User } from '@users/domain/entitys/user.entity';

import { PARTNER_REPOSITORY, PartnerRepository } from '../../domain/repos/partner.repository';
import { PARTNER_LINK_SESSION_REPOSITORY, PartnerLinkSessionRepository } from '../../domain/repos/partner-link-session.repository';
import { PARTNER_LINKED_USER_REPOSITORY, PartnerLinkedUserRepository } from '../../domain/repos/partner-linked-user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';
import { AUTHORIZATION_CODE_REPOSITORY } from '../../domain/repos/authorization-code.repository';
import type { AuthorizationCodeRepository } from '../../domain/repos/authorization-code.repository';
import type { UserRepository } from '@users/domain/repos/user.repository';

import { PartnerLinkSession } from '../../domain/entities/partner-link-session.entity';
import { PartnerLinkedUser } from '../../domain/entities/partner-linked-user.entity';
import { AuthorizationCode } from '../../domain/entities/authorization-code.entity';

import {
    InitiateLinkQueryDto,
    ConsentPageResponseDto,
    ConfirmLinkDto,
    ConfirmLinkResponseDto,
    CancelLinkDto,
} from '../dtos/oauth-link.dto';


@ApiTags('oauth-link')
@Controller('oauth/link')
export class OAuthLinkController {
    private readonly logger = new Logger(OAuthLinkController.name);

    private readonly DEFAULT_PERMISSIONS = [
        'Crear y gestionar tiendas',
        'Administrar inventario',
        'Registrar ventas',
        'Invitar usuarios a tus tiendas',
    ];

    constructor(
        @Inject(PARTNER_REPOSITORY)
        private readonly partnerRepository: PartnerRepository,
        @Inject(PARTNER_LINK_SESSION_REPOSITORY)
        private readonly linkSessionRepository: PartnerLinkSessionRepository,
        @Inject(PARTNER_LINKED_USER_REPOSITORY)
        private readonly linkedUserRepository: PartnerLinkedUserRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(AUTHORIZATION_CODE_REPOSITORY)
        private readonly authCodeRepository: AuthorizationCodeRepository,
    ) { }

    /**
     * GET /oauth/link
     * Initiates the linking flow with consent
     */
    @Public()
    @Get()
    @ApiOperation({ summary: 'Initiate partner account linking with consent' })
    @ApiResponse({ status: 302, description: 'Redirect to consent page' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async initiateLink(
        @Query() query: InitiateLinkQueryDto,
        @Res() reply: FastifyReply,
    ) {
        this.logger.debug(`Link initiation request from client: ${query.client_id}`);

        // 1. Find partner by client_id
        const partner = await this.partnerRepository.findAll();
        const matchedPartner = partner.find(p => p.toPrimitives().client_id === query.client_id);

        if (!matchedPartner) {
            throw new BadRequestException({
                error: 'invalid_client',
                error_description: 'Client ID not found',
            });
        }

        const partnerData = matchedPartner.toPrimitives();

        // 2. Check if partner can link users
        if (!partnerData.can_link_users) {
            throw new BadRequestException({
                error: 'linking_disabled',
                error_description: 'This partner is not authorized for account linking',
            });
        }

        // 3. Validate redirect_uri
        if (!partnerData.allowed_redirect_uris.includes(query.redirect_uri)) {
            throw new BadRequestException({
                error: 'invalid_redirect_uri',
                error_description: 'Redirect URI is not registered for this client',
            });
        }

        // 4. Create link session
        const session = PartnerLinkSession.create({
            partner_id: partnerData.id,
            client_id: query.client_id,
            redirect_uri: query.redirect_uri,
            external_user_id: query.external_user_id,
            external_email: query.external_email,
            external_name: query.external_name,
            state: query.state,
            expires_in_minutes: 10,
        });

        await this.linkSessionRepository.create(session);

        // 5. Return session info (frontend will handle the consent UI)
        // In a real scenario, this would redirect to a frontend page
        // For API testing, we return the session ID
        return reply.send({
            session_id: session.idValue,
            consent_url: `/oauth/link/consent?session=${session.idValue}`,
            message: 'Redirect user to consent_url to complete linking',
        });
    }

    /**
     * GET /oauth/link/consent
     * Get consent page data
     */
    @Public()
    @Get('consent')
    @ApiOperation({ summary: 'Get consent page data for linking' })
    @ApiResponse({ status: 200, description: 'Consent page data', type: ConsentPageResponseDto })
    @ApiResponse({ status: 400, description: 'Session expired or invalid' })
    async getConsentPage(
        @Query('session') sessionId: string,
    ): Promise<ConsentPageResponseDto> {
        if (!sessionId) {
            throw new BadRequestException({
                error: 'missing_session',
                error_description: 'Session ID is required',
            });
        }

        const session = await this.linkSessionRepository.findById(sessionId);

        if (!session) {
            throw new BadRequestException({
                error: 'session_not_found',
                error_description: 'Link session not found',
            });
        }

        if (session.isExpired()) {
            await this.linkSessionRepository.delete(sessionId);
            throw new BadRequestException({
                error: 'session_expired',
                error_description: 'Link session has expired',
            });
        }

        const partner = await this.partnerRepository.findById(session.partnerIdValue);
        if (!partner) {
            throw new BadRequestException({
                error: 'partner_not_found',
                error_description: 'Partner not found',
            });
        }

        const partnerData = partner.toPrimitives();

        // Check if user already has a Wheek account
        let hasExistingAccount = false;
        if (session.externalEmailValue) {
            const existingUser = await this.userRepository.findByEmail(session.externalEmailValue);
            hasExistingAccount = !!existingUser;
        }

        return {
            session_id: sessionId,
            partner: {
                name: partnerData.name,
                logo_url: partnerData.logo_url ?? null,
                description: partnerData.description ?? null,
            },
            external_email: session.externalEmailValue || '',
            external_name: session.externalNameValue || '',
            has_existing_account: hasExistingAccount,
            permissions: this.DEFAULT_PERMISSIONS,
        };
    }

    /**
     * POST /oauth/link/confirm
     * Confirm the linking and create/link account
     */
    @Public()
    @Post('confirm')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Confirm account linking' })
    @ApiResponse({ status: 200, description: 'Linking confirmed', type: ConfirmLinkResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async confirmLink(
        @Body() body: ConfirmLinkDto,
    ): Promise<ConfirmLinkResponseDto> {
        this.logger.debug(`Confirming link for session: ${body.session_id}`);

        // 1. Find and validate session
        const session = await this.linkSessionRepository.findById(body.session_id);

        if (!session) {
            throw new BadRequestException({
                error: 'session_not_found',
                error_description: 'Link session not found',
            });
        }

        if (session.isExpired()) {
            await this.linkSessionRepository.delete(body.session_id);
            throw new BadRequestException({
                error: 'session_expired',
                error_description: 'Link session has expired',
            });
        }

        // 2. Check if user already exists in Wheek
        let wheekUser = session.externalEmailValue
            ? await this.userRepository.findByEmail(session.externalEmailValue)
            : null;

        // 3. If no existing user, create one
        if (!wheekUser) {
            if (!body.password) {
                throw new BadRequestException({
                    error: 'password_required',
                    error_description: 'Password is required for new accounts',
                });
            }

            if (!session.externalEmailValue) {
                throw new BadRequestException({
                    error: 'email_required',
                    error_description: 'Email is required for new accounts',
                });
            }

            // Create new user
            const username = this.generateUsername(session.externalEmailValue);

            const newUser = await User.create({
                email: session.externalEmailValue,
                name: body.name || session.externalNameValue || 'User',
                last_name: body.last_name || '',
                username: username,
                password: body.password,
            });

            wheekUser = await this.userRepository.create(newUser);

            this.logger.debug(`Created new Wheek user: ${wheekUser.idValue}`);
        }

        // 4. Check if linking already exists
        const existingLink = await this.linkedUserRepository.findByPartnerAndExternalUser(
            session.partnerIdValue,
            session.externalUserIdValue,
        );

        if (existingLink) {
            // Already linked, just return redirect
            const redirectUrl = this.buildSuccessRedirect(
                session.redirectUriValue,
                session.stateValue,
                existingLink.wheekUserIdValue,
            );

            await this.linkSessionRepository.delete(body.session_id);

            return { redirect_url: redirectUrl };
        }

        // 5. Create linking record
        const linkedUser = PartnerLinkedUser.create({
            partner_id: session.partnerIdValue,
            external_user_id: session.externalUserIdValue,
            wheek_user_id: wheekUser.idValue,
            external_email: session.externalEmailValue,
            external_name: session.externalNameValue,
        });

        await this.linkedUserRepository.create(linkedUser);

        // 6. Generate authorization code for token exchange
        const authCode = AuthorizationCode.create({
            client_id: session.clientIdValue,
            user_id: wheekUser.idValue,
            redirect_uri: session.redirectUriValue,
            scopes: ['profile', 'stores:all', 'inventory:write', 'products:write', 'sales:write'],
            code_challenge: undefined,
            code_challenge_method: undefined,
            state: session.stateValue,
        });

        await this.authCodeRepository.save(authCode);

        // 7. Delete session
        await this.linkSessionRepository.delete(body.session_id);

        // 8. Build redirect URL with code
        const redirectUrl = new URL(session.redirectUriValue);
        redirectUrl.searchParams.set('code', authCode.codeValue);
        redirectUrl.searchParams.set('state', session.stateValue);

        this.logger.debug(`Link confirmed, redirecting to: ${redirectUrl.origin}`);

        return { redirect_url: redirectUrl.toString() };
    }

    /**
     * POST /oauth/link/cancel
     * Cancel the linking process
     */
    @Public()
    @Post('cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel account linking' })
    @ApiResponse({ status: 200, description: 'Linking cancelled' })
    async cancelLink(
        @Body() body: CancelLinkDto,
    ): Promise<{ redirect_url: string }> {
        const session = await this.linkSessionRepository.findById(body.session_id);

        if (!session) {
            throw new BadRequestException({
                error: 'session_not_found',
                error_description: 'Link session not found',
            });
        }

        await this.linkSessionRepository.delete(body.session_id);

        const redirectUrl = new URL(session.redirectUriValue);
        redirectUrl.searchParams.set('error', 'access_denied');
        redirectUrl.searchParams.set('error_description', 'User cancelled the linking process');
        redirectUrl.searchParams.set('state', session.stateValue);

        return { redirect_url: redirectUrl.toString() };
    }


    // ===== Helper Methods =====

    private generateUsername(email: string): string {
        const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const random = crypto.randomBytes(4).toString('hex');
        return `${base}_${random}`;
    }

    private buildSuccessRedirect(redirectUri: string, state: string, userId: string): string {
        const url = new URL(redirectUri);
        url.searchParams.set('status', 'already_linked');
        url.searchParams.set('state', state);
        url.searchParams.set('wheek_user_id', userId);
        return url.toString();
    }
}

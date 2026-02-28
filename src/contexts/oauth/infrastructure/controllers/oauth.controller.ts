import {
    Controller,
    Get,
    Post,
    Query,
    Body,
    Req,
    Res,
    BadRequestException,
    UnauthorizedException,
    Logger,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/src/common/decorators/public.decorator';
import { FastifyRequest, FastifyReply } from 'fastify';

import { AuthorizeUseCase } from '../../application/authorize.usecase';
import { TokenExchangeUseCase } from '../../application/token-exchange.usecase';
import { TokenRefreshUseCase } from '../../application/token-refresh.usecase';
import { TokenRevokeUseCase } from '../../application/token-revoke.usecase';

import {
    AuthorizeQueryDto,
    TokenRequestDto,
    TokenResponseDto,
    RevokeRequestDto,
    RevokeResponseDto,
    OAuthErrorDto,
} from '../dtos/oauth.dto';

@ApiTags('oauth')
@Controller('oauth')
export class OAuthController {
    private readonly logger = new Logger(OAuthController.name);

    constructor(
        private readonly authorizeUseCase: AuthorizeUseCase,
        private readonly tokenExchangeUseCase: TokenExchangeUseCase,
        private readonly tokenRefreshUseCase: TokenRefreshUseCase,
        private readonly tokenRevokeUseCase: TokenRevokeUseCase,
    ) { }

    /**
     * OAuth Authorization Endpoint
     * Initiates the authorization flow
     */
    @Public()
    @Get('authorize')
    @ApiOperation({ summary: 'OAuth 2.0 Authorization Endpoint' })
    @ApiQuery({ name: 'client_id', required: true, description: 'OAuth client ID' })
    @ApiQuery({ name: 'redirect_uri', required: true, description: 'Callback URL' })
    @ApiQuery({ name: 'response_type', required: true, description: 'Must be "code"' })
    @ApiQuery({ name: 'scope', required: true, description: 'Space-separated scopes' })
    @ApiQuery({ name: 'state', required: true, description: 'Anti-CSRF token' })
    @ApiQuery({ name: 'code_challenge', required: false, description: 'PKCE challenge' })
    @ApiQuery({ name: 'code_challenge_method', required: false, description: 'PKCE method (S256)' })
    @ApiResponse({ status: 302, description: 'Redirect to login or consent page' })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    async authorize(
        @Query() query: AuthorizeQueryDto,
        @Req() request: FastifyRequest,
        @Res() reply: FastifyReply,
    ) {
        this.logger.debug(`Authorization request from client: ${query.client_id}`);

        // Check if user is authenticated (via JWT in session/cookie)
        // For now, we'll require the user to be authenticated before reaching this endpoint
        // In a full implementation, this would redirect to a login page first

        const userId = (request as any).user?.sub;

        if (!userId) {
            // In production, redirect to login page with return URL
            // For now, return error since we need a logged-in user
            const errorRedirect = this.buildErrorRedirect(
                query.redirect_uri,
                'login_required',
                'User must be logged in to authorize',
                query.state,
            );
            return reply.status(302).redirect(errorRedirect);
        }

        const result = await this.authorizeUseCase.execute({
            client_id: query.client_id,
            redirect_uri: query.redirect_uri,
            response_type: query.response_type,
            scope: query.scope,
            state: query.state,
            code_challenge: query.code_challenge,
            code_challenge_method: query.code_challenge_method,
            user_id: userId,
        });

        if (!result.isSuccess) {
            const error = result.error.message;
            const [errorCode, errorDescription] = error.includes(':')
                ? error.split(': ', 2)
                : ['server_error', error];

            const errorRedirect = this.buildErrorRedirect(
                query.redirect_uri,
                errorCode,
                errorDescription,
                query.state,
            );
            return reply.status(302).redirect(errorRedirect);
        }

        // Redirect with authorization code
        return reply.status(302).redirect(result.value.redirect_url);
    }

    /**
     * Endpoint for programmatic authorization (when user confirms consent via API)
     */
    @Post('authorize/confirm')
    @ApiOperation({ summary: 'Confirm OAuth authorization (API-based consent)' })
    @ApiResponse({ status: 200, description: 'Authorization confirmed' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 401, description: 'User not authenticated' })
    async confirmAuthorize(
        @Body() body: AuthorizeQueryDto,
        @Req() request: FastifyRequest,
    ) {
        const userId = (request as any).user?.sub;

        if (!userId) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'User must be authenticated',
            });
        }

        const result = await this.authorizeUseCase.execute({
            client_id: body.client_id,
            redirect_uri: body.redirect_uri,
            response_type: body.response_type,
            scope: body.scope,
            state: body.state,
            code_challenge: body.code_challenge,
            code_challenge_method: body.code_challenge_method,
            user_id: userId,
        });

        if (!result.isSuccess) {
            const error = result.error.message;
            throw new BadRequestException({
                error: error.split(':')[0] || 'server_error',
                error_description: error.split(': ')[1] || error,
            });
        }

        return {
            redirect_url: result.value.redirect_url,
            code: result.value.code,
            state: result.value.state,
        };
    }

    /**
     * OAuth Token Endpoint
     * Exchanges authorization code for tokens or refreshes tokens
     */
    @Public()
    @Post('token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'OAuth 2.0 Token Endpoint' })
    @ApiResponse({ status: 200, description: 'Token issued', type: TokenResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 401, description: 'Invalid client credentials' })
    async token(@Body() body: TokenRequestDto): Promise<TokenResponseDto | OAuthErrorDto> {
        this.logger.debug(`Token request with grant_type: ${body.grant_type}`);

        if (body.grant_type === 'authorization_code') {
            if (!body.code || !body.redirect_uri) {
                throw new BadRequestException({
                    error: 'invalid_request',
                    error_description: 'code and redirect_uri are required for authorization_code grant',
                });
            }

            const result = await this.tokenExchangeUseCase.execute({
                grant_type: 'authorization_code',
                client_id: body.client_id,
                client_secret: body.client_secret,
                redirect_uri: body.redirect_uri,
                code: body.code,
                code_verifier: body.code_verifier,
            });

            if (!result.isSuccess) {
                const error = result.error.message;
                const [errorCode, errorDescription] = error.includes(':')
                    ? error.split(': ', 2)
                    : ['server_error', error];
                throw new BadRequestException({
                    error: errorCode,
                    error_description: errorDescription,
                });
            }

            return result.value;

        } else if (body.grant_type === 'refresh_token') {
            if (!body.refresh_token) {
                throw new BadRequestException({
                    error: 'invalid_request',
                    error_description: 'refresh_token is required for refresh_token grant',
                });
            }

            const result = await this.tokenRefreshUseCase.execute({
                grant_type: 'refresh_token',
                client_id: body.client_id,
                client_secret: body.client_secret,
                refresh_token: body.refresh_token,
            });

            if (!result.isSuccess) {
                const error = result.error.message;
                const [errorCode, errorDescription] = error.includes(':')
                    ? error.split(': ', 2)
                    : ['server_error', error];
                throw new BadRequestException({
                    error: errorCode,
                    error_description: errorDescription,
                });
            }

            return result.value;

        } else {
            throw new BadRequestException({
                error: 'unsupported_grant_type',
                error_description: 'Only authorization_code and refresh_token grants are supported',
            });
        }
    }

    /**
     * OAuth Token Revocation Endpoint
     */
    @Public()
    @Post('revoke')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'OAuth 2.0 Token Revocation Endpoint' })
    @ApiResponse({ status: 200, description: 'Token revoked', type: RevokeResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid client credentials' })
    async revoke(@Body() body: RevokeRequestDto): Promise<RevokeResponseDto> {
        this.logger.debug(`Token revocation request from client: ${body.client_id}`);

        const result = await this.tokenRevokeUseCase.execute({
            client_id: body.client_id,
            client_secret: body.client_secret,
            token: body.token,
        });

        if (!result.isSuccess) {
            const error = result.error.message;
            const [errorCode, errorDescription] = error.includes(':')
                ? error.split(': ', 2)
                : ['server_error', error];
            throw new UnauthorizedException({
                error: errorCode,
                error_description: errorDescription,
            });
        }

        return result.value;
    }

    /**
     * Build error redirect URL for OAuth errors
     */
    private buildErrorRedirect(
        redirectUri: string,
        error: string,
        errorDescription: string,
        state: string,
    ): string {
        const url = new URL(redirectUri);
        url.searchParams.set('error', error);
        url.searchParams.set('error_description', errorDescription);
        url.searchParams.set('state', state);
        return url.toString();
    }
}

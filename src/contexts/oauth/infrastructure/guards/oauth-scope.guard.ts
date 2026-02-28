import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, Inject, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OAuthTokenRepository, OAUTH_TOKEN_REPOSITORY } from '../../domain/repos/oauth-token.repository';

export const REQUIRED_SCOPES_KEY = 'requiredScopes';
export const RequireScopes = (...scopes: string[]) => SetMetadata(REQUIRED_SCOPES_KEY, scopes);

@Injectable()
export class OAuthScopeGuard implements CanActivate {
    constructor(
        @Inject(OAUTH_TOKEN_REPOSITORY)
        private readonly oauthTokenRepository: OAuthTokenRepository,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Get required scopes from decorator
        const requiredScopes = this.reflector.get<string[]>(REQUIRED_SCOPES_KEY, context.getHandler()) || [];

        // Get token from Authorization header
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'Missing Authorization header',
            });
        }

        // Extract token
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'Invalid Authorization header format. Expected: Bearer <token>',
            });
        }

        // Find and validate token
        const oauthToken = await this.oauthTokenRepository.findByAccessToken(token);

        if (!oauthToken) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'Invalid or expired access token',
            });
        }

        if (!oauthToken.isAccessTokenValid()) {
            const reason = oauthToken.isRevoked() ? 'revoked' : 'expired';
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: `Access token has been ${reason}`,
            });
        }

        // Check required scopes
        if (requiredScopes.length > 0) {
            const missingScopes = requiredScopes.filter(scope => !oauthToken.hasScope(scope));
            if (missingScopes.length > 0) {
                throw new ForbiddenException({
                    error: 'insufficient_scope',
                    message: `Missing required scopes: ${missingScopes.join(', ')}`,
                });
            }
        }

        // Attach token info to request
        request.oauthToken = oauthToken;
        request.oauthUserId = oauthToken.userIdValue;
        request.oauthScopes = oauthToken.scopesValue;

        return true;
    }
}

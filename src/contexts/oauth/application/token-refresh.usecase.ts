import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { OAuthClientRepository, OAUTH_CLIENT_REPOSITORY } from '../domain/repos/oauth-client.repository';
import { OAuthTokenRepository, OAUTH_TOKEN_REPOSITORY } from '../domain/repos/oauth-token.repository';
import { OAuthToken } from '../domain/entities/oauth-token.entity';

export interface TokenRefreshRequest {
    grant_type: 'refresh_token';
    client_id: string;
    client_secret: string;
    refresh_token: string;
}

export interface TokenRefreshResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

@Injectable()
export class TokenRefreshUseCase {
    private readonly logger = new Logger(TokenRefreshUseCase.name);

    constructor(
        @Inject(OAUTH_CLIENT_REPOSITORY)
        private readonly oauthClientRepository: OAuthClientRepository,
        @Inject(OAUTH_TOKEN_REPOSITORY)
        private readonly oauthTokenRepository: OAuthTokenRepository,
    ) { }

    async execute(request: TokenRefreshRequest): Promise<Result<TokenRefreshResponse, Error>> {
        try {
            this.logger.debug(`Processing token refresh for client: ${request.client_id}`);

            // 1. Validate grant_type
            if (request.grant_type !== 'refresh_token') {
                return failure(new Error('unsupported_grant_type: Only refresh_token is supported'));
            }

            // 2. Find and validate client
            const client = await this.oauthClientRepository.findByClientId(request.client_id);
            if (!client) {
                return failure(new Error('invalid_client: Client not found'));
            }

            // 3. Validate client secret
            if (!client.validateSecret(request.client_secret)) {
                return failure(new Error('invalid_client: Invalid client credentials'));
            }

            if (!client.isActiveValue) {
                return failure(new Error('invalid_client: Client is not active'));
            }

            // 4. Find token by refresh_token
            const existingToken = await this.oauthTokenRepository.findByRefreshToken(request.refresh_token);
            if (!existingToken) {
                return failure(new Error('invalid_grant: Refresh token not found'));
            }

            // 5. Validate refresh token
            if (existingToken.isRevoked()) {
                return failure(new Error('invalid_grant: Refresh token has been revoked'));
            }

            if (existingToken.isRefreshTokenExpired()) {
                return failure(new Error('invalid_grant: Refresh token has expired'));
            }

            // 6. Validate client_id matches
            if (existingToken.clientIdValue !== request.client_id) {
                return failure(new Error('invalid_grant: Refresh token was not issued to this client'));
            }

            // 7. Revoke old token
            await this.oauthTokenRepository.revokeByRefreshToken(request.refresh_token);

            // 8. Create new token with same scopes
            const newToken = OAuthToken.create({
                client_id: request.client_id,
                user_id: existingToken.userIdValue,
                scopes: existingToken.scopesValue,
            });

            // 9. Save new token
            await this.oauthTokenRepository.save(newToken);

            this.logger.log(`Token refreshed for client: ${request.client_id}, user: ${existingToken.userIdValue}`);

            return success({
                access_token: newToken.accessTokenValue,
                token_type: 'Bearer',
                expires_in: newToken.getAccessTokenExpiresIn(),
                refresh_token: newToken.refreshTokenValue,
                scope: newToken.scopesValue.join(' '),
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error processing token refresh: ${errorMessage}`);
            return failure(new Error('server_error: An error occurred processing the token refresh request'));
        }
    }
}

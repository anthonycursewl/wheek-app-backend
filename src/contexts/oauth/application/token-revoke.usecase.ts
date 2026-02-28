import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { OAuthClientRepository, OAUTH_CLIENT_REPOSITORY } from '../domain/repos/oauth-client.repository';
import { OAuthTokenRepository, OAUTH_TOKEN_REPOSITORY } from '../domain/repos/oauth-token.repository';

export interface TokenRevokeRequest {
    client_id: string;
    client_secret: string;
    token: string;
}

export interface TokenRevokeResponse {
    revoked: boolean;
}

@Injectable()
export class TokenRevokeUseCase {
    private readonly logger = new Logger(TokenRevokeUseCase.name);

    constructor(
        @Inject(OAUTH_CLIENT_REPOSITORY)
        private readonly oauthClientRepository: OAuthClientRepository,
        @Inject(OAUTH_TOKEN_REPOSITORY)
        private readonly oauthTokenRepository: OAuthTokenRepository,
    ) { }

    async execute(request: TokenRevokeRequest): Promise<Result<TokenRevokeResponse, Error>> {
        try {
            this.logger.debug(`Processing token revocation for client: ${request.client_id}`);

            // 1. Find and validate client
            const client = await this.oauthClientRepository.findByClientId(request.client_id);
            if (!client) {
                return failure(new Error('invalid_client: Client not found'));
            }

            // 2. Validate client secret
            if (!client.validateSecret(request.client_secret)) {
                return failure(new Error('invalid_client: Invalid client credentials'));
            }

            // 3. Try to find token as access_token first
            let token = await this.oauthTokenRepository.findByAccessToken(request.token);

            if (token) {
                // Validate client_id matches
                if (token.clientIdValue !== request.client_id) {
                    // Per RFC 7009, return success even if token doesn't belong to client
                    // to prevent token enumeration attacks
                    this.logger.debug('Token does not belong to client, returning success');
                    return success({ revoked: true });
                }

                await this.oauthTokenRepository.revokeByAccessToken(request.token);
                this.logger.log(`Access token revoked for client: ${request.client_id}`);
                return success({ revoked: true });
            }

            // 4. Try as refresh_token
            token = await this.oauthTokenRepository.findByRefreshToken(request.token);

            if (token) {
                // Validate client_id matches
                if (token.clientIdValue !== request.client_id) {
                    // Per RFC 7009, return success even if token doesn't belong to client
                    this.logger.debug('Token does not belong to client, returning success');
                    return success({ revoked: true });
                }

                await this.oauthTokenRepository.revokeByRefreshToken(request.token);
                this.logger.log(`Refresh token revoked for client: ${request.client_id}`);
                return success({ revoked: true });
            }

            // 5. Token not found - RFC 7009 says to return success anyway
            this.logger.debug('Token not found, returning success per RFC 7009');
            return success({ revoked: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error processing token revocation: ${errorMessage}`);
            return failure(new Error('server_error: An error occurred processing the revocation request'));
        }
    }
}

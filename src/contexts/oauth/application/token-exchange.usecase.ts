import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { OAuthClientRepository, OAUTH_CLIENT_REPOSITORY } from '../domain/repos/oauth-client.repository';
import { AuthorizationCodeRepository, AUTHORIZATION_CODE_REPOSITORY } from '../domain/repos/authorization-code.repository';
import { OAuthTokenRepository, OAUTH_TOKEN_REPOSITORY } from '../domain/repos/oauth-token.repository';
import { OAuthToken } from '../domain/entities/oauth-token.entity';

export interface TokenExchangeRequest {
    grant_type: 'authorization_code';
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    code: string;
    code_verifier?: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

@Injectable()
export class TokenExchangeUseCase {
    private readonly logger = new Logger(TokenExchangeUseCase.name);

    constructor(
        @Inject(OAUTH_CLIENT_REPOSITORY)
        private readonly oauthClientRepository: OAuthClientRepository,
        @Inject(AUTHORIZATION_CODE_REPOSITORY)
        private readonly authorizationCodeRepository: AuthorizationCodeRepository,
        @Inject(OAUTH_TOKEN_REPOSITORY)
        private readonly oauthTokenRepository: OAuthTokenRepository,
    ) { }

    async execute(request: TokenExchangeRequest): Promise<Result<TokenResponse, Error>> {
        try {
            this.logger.debug(`Processing token exchange for client: ${request.client_id}`);

            // 1. Validate grant_type
            if (request.grant_type !== 'authorization_code') {
                return failure(new Error('unsupported_grant_type: Only authorization_code is supported'));
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

            // 4. Find authorization code
            const authCode = await this.authorizationCodeRepository.findByCode(request.code);
            if (!authCode) {
                return failure(new Error('invalid_grant: Authorization code not found'));
            }

            // 5. Validate authorization code
            if (authCode.isUsed()) {
                return failure(new Error('invalid_grant: Authorization code has already been used'));
            }

            if (authCode.isExpired()) {
                return failure(new Error('invalid_grant: Authorization code has expired'));
            }

            // 6. Validate client_id matches
            if (authCode.clientIdValue !== request.client_id) {
                return failure(new Error('invalid_grant: Authorization code was not issued to this client'));
            }

            // 7. Validate redirect_uri matches
            if (authCode.redirectUriValue !== request.redirect_uri) {
                return failure(new Error('invalid_grant: redirect_uri does not match'));
            }

            // 8. Validate PKCE if code_challenge was used
            if (authCode.codeChallengeValue) {
                if (!request.code_verifier) {
                    return failure(new Error('invalid_grant: code_verifier is required'));
                }

                if (!authCode.validateCodeVerifier(request.code_verifier)) {
                    return failure(new Error('invalid_grant: code_verifier is invalid'));
                }
            }

            // 9. Mark authorization code as used
            await this.authorizationCodeRepository.markAsUsed(request.code);

            // 10. Create OAuth token
            const token = OAuthToken.create({
                client_id: request.client_id,
                user_id: authCode.userIdValue,
                scopes: authCode.scopesValue,
            });

            // 11. Save token
            await this.oauthTokenRepository.save(token);

            this.logger.log(`Token issued for client: ${request.client_id}, user: ${authCode.userIdValue}`);

            return success({
                access_token: token.accessTokenValue,
                token_type: 'Bearer',
                expires_in: token.getAccessTokenExpiresIn(),
                refresh_token: token.refreshTokenValue,
                scope: authCode.scopesValue.join(' '),
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error processing token exchange: ${errorMessage}`);
            return failure(new Error('server_error: An error occurred processing the token request'));
        }
    }
}

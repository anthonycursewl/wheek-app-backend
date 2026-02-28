import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { OAuthClientRepository, OAUTH_CLIENT_REPOSITORY } from '../domain/repos/oauth-client.repository';
import { AuthorizationCodeRepository, AUTHORIZATION_CODE_REPOSITORY } from '../domain/repos/authorization-code.repository';
import { AuthorizationCode } from '../domain/entities/authorization-code.entity';
import { UserRepository, USER_REPOSITORY } from '@users/domain/repos/user.repository';

export interface AuthorizeRequest {
    client_id: string;
    redirect_uri: string;
    response_type: string;
    scope: string;
    state: string;
    code_challenge?: string;
    code_challenge_method?: string;
    user_id: string; // The authenticated user ID
}

export interface AuthorizeResponse {
    redirect_url: string;
    code: string;
    state: string;
}

@Injectable()
export class AuthorizeUseCase {
    private readonly logger = new Logger(AuthorizeUseCase.name);

    constructor(
        @Inject(OAUTH_CLIENT_REPOSITORY)
        private readonly oauthClientRepository: OAuthClientRepository,
        @Inject(AUTHORIZATION_CODE_REPOSITORY)
        private readonly authorizationCodeRepository: AuthorizationCodeRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(request: AuthorizeRequest): Promise<Result<AuthorizeResponse, Error>> {
        try {
            this.logger.debug(`Processing authorization request for client: ${request.client_id}`);

            // 1. Validate response_type
            if (request.response_type !== 'code') {
                return failure(new Error('invalid_request: response_type must be "code"'));
            }

            // 2. Find and validate client
            const client = await this.oauthClientRepository.findByClientId(request.client_id);
            if (!client) {
                return failure(new Error('invalid_client: Client not found'));
            }

            if (!client.isActiveValue) {
                return failure(new Error('invalid_client: Client is not active'));
            }

            // 3. Validate redirect_uri
            if (!client.validateRedirectUri(request.redirect_uri)) {
                return failure(new Error('invalid_request: redirect_uri is not registered'));
            }

            // 4. Validate scopes
            const requestedScopes = request.scope.split(' ').filter(s => s.length > 0);
            const scopeValidation = client.validateScopes(requestedScopes);
            if (!scopeValidation.valid) {
                return failure(new Error(`invalid_scope: The following scopes are not allowed: ${scopeValidation.invalidScopes.join(', ')}`));
            }

            // 5. Validate PKCE if enabled and provided
            if (client.pkceEnabledValue && request.code_challenge) {
                if (request.code_challenge_method !== 'S256' && request.code_challenge_method !== 'plain') {
                    return failure(new Error('invalid_request: code_challenge_method must be S256 or plain'));
                }
            }

            // 6. Verify user exists
            const user = await this.userRepository.findById(request.user_id);
            if (!user) {
                return failure(new Error('invalid_request: User not found'));
            }

            // 7. Create authorization code
            const authorizationCode = AuthorizationCode.create({
                client_id: request.client_id,
                user_id: request.user_id,
                redirect_uri: request.redirect_uri,
                scopes: requestedScopes,
                code_challenge: request.code_challenge,
                code_challenge_method: request.code_challenge_method,
                state: request.state,
            });

            // 8. Save authorization code
            await this.authorizationCodeRepository.save(authorizationCode);

            // 9. Build redirect URL
            const redirectUrl = this.buildRedirectUrl(
                request.redirect_uri,
                authorizationCode.codeValue,
                request.state,
            );

            this.logger.log(`Authorization code generated for client: ${request.client_id}, user: ${request.user_id}`);

            return success({
                redirect_url: redirectUrl,
                code: authorizationCode.codeValue,
                state: request.state,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error processing authorization request: ${errorMessage}`);
            return failure(new Error('server_error: An error occurred processing the authorization request'));
        }
    }

    private buildRedirectUrl(baseUrl: string, code: string, state: string): string {
        const url = new URL(baseUrl);
        url.searchParams.set('code', code);
        url.searchParams.set('state', state);
        return url.toString();
    }
}

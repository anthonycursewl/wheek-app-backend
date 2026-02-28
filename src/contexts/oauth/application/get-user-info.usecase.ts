import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { OAuthTokenRepository, OAUTH_TOKEN_REPOSITORY } from '../domain/repos/oauth-token.repository';
import { UserRepository, USER_REPOSITORY } from '@users/domain/repos/user.repository';

export interface UserInfoResponse {
    id: string;
    user_id: string;
    email: string;
    name: string;
    display_name: string;
    avatar_url: string | null;
    profile_image: string | null;
    email_verified: boolean;
    username: string;
    created_at: string;
    subscription?: {
        plan: string;
        expires_at: string | null;
    };
}

@Injectable()
export class GetUserInfoUseCase {
    private readonly logger = new Logger(GetUserInfoUseCase.name);

    constructor(
        @Inject(OAUTH_TOKEN_REPOSITORY)
        private readonly oauthTokenRepository: OAuthTokenRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(accessToken: string): Promise<Result<UserInfoResponse, Error>> {
        try {
            this.logger.debug('Processing user info request');

            // 1. Find token
            const token = await this.oauthTokenRepository.findByAccessToken(accessToken);
            if (!token) {
                return failure(new Error('unauthorized: Invalid or expired access token'));
            }

            // 2. Validate token
            if (!token.isAccessTokenValid()) {
                return failure(new Error('unauthorized: Access token has expired or been revoked'));
            }

            // 3. Check required scope
            if (!token.hasScope('profile') && !token.hasScope('email')) {
                return failure(new Error('insufficient_scope: Token does not have required scope'));
            }

            // 4. Get user info
            const user = await this.userRepository.findById(token.userIdValue);
            if (!user) {
                return failure(new Error('unauthorized: User not found'));
            }

            // 5. Build response based on scopes
            const response: UserInfoResponse = {
                id: user.idValue,
                user_id: user.idValue,
                email: token.hasScope('email') ? user.emailValue : '',
                name: user.nameValue + ' ' + user.lastNameValue,
                display_name: user.nameValue + ' ' + user.lastNameValue,
                avatar_url: user.iconUrlValue || null,
                profile_image: user.iconUrlValue || null,
                email_verified: true, // Default to true since we don't track this separately
                username: user.usernameValue,
                created_at: user.createdAtValue.toISOString(),
            };

            // Add subscription info if available
            // Note: This would need to be extended if subscription tracking is added
            response.subscription = {
                plan: 'free', // Default plan
                expires_at: null,
            };

            this.logger.log(`User info retrieved for user: ${user.idValue}`);

            return success(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error retrieving user info: ${errorMessage}`);
            return failure(new Error('server_error: An error occurred retrieving user information'));
        }
    }
}

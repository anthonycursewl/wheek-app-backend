import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { UserRepository, USER_REPOSITORY } from '@users/domain/repos/user.repository';

export interface UserStatusResponse {
    user_id: string;
    email_verified: boolean;
    account_status: string;
    created_at: string;
    last_login_at: string | null;
}

@Injectable()
export class GetUserStatusUseCase {
    private readonly logger = new Logger(GetUserStatusUseCase.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(userId: string): Promise<Result<UserStatusResponse, Error>> {
        try {
            this.logger.debug(`Getting status for user: ${userId}`);

            // 1. Find user
            const user = await this.userRepository.findById(userId);
            if (!user) {
                return failure(new Error('user_not_found: User not found'));
            }

            // 2. Determine account status
            let accountStatus = 'active';
            if (!user.isActiveValue) {
                accountStatus = user.deletedAtValue ? 'deleted' : 'inactive';
            }

            this.logger.log(`User status retrieved: ${userId}`);

            return success({
                user_id: user.idValue,
                email_verified: true, // Default to true since we don't track this separately
                account_status: accountStatus,
                created_at: user.createdAtValue.toISOString(),
                last_login_at: user.updatedAtValue?.toISOString() || null, // Using updated_at as proxy for last login
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error getting user status: ${errorMessage}`);
            return failure(new Error('server_error: An error occurred retrieving user status'));
        }
    }
}

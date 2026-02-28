import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { UserRepository, USER_REPOSITORY } from '@users/domain/repos/user.repository';

export interface LookupUserRequest {
    email: string;
}

export interface LookupUserResponse {
    user_id: string;
    id: string;
    email: string;
    name: string;
    verified: boolean;
    created_at: string;
}

@Injectable()
export class LookupUserUseCase {
    private readonly logger = new Logger(LookupUserUseCase.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(request: LookupUserRequest): Promise<Result<LookupUserResponse, Error>> {
        try {
            this.logger.debug(`Looking up user by email: ${request.email}`);

            // 1. Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(request.email)) {
                return failure(new Error('invalid_email: Email format is not valid'));
            }

            // 2. Find user by email
            const user = await this.userRepository.findByEmail(request.email);
            if (!user) {
                return failure(new Error('user_not_found: No user found with this email'));
            }

            // 3. Check if user is active
            if (!user.isActiveValue) {
                return failure(new Error('user_not_found: No active user found with this email'));
            }

            this.logger.log(`User found: ${user.idValue}`);

            return success({
                user_id: user.idValue,
                id: user.idValue,
                email: user.emailValue,
                name: user.nameValue + ' ' + user.lastNameValue,
                verified: true, // Default to true since we don't track email verification separately
                created_at: user.createdAtValue.toISOString(),
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error looking up user: ${errorMessage}`);
            return failure(new Error('server_error: An error occurred looking up the user'));
        }
    }
}

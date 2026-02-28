import { Injectable, Inject, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { UserRepository, USER_REPOSITORY } from '@users/domain/repos/user.repository';
import { User } from '@users/domain/entitys/user.entity';
import * as crypto from 'crypto';

export interface ProvisionUserRequest {
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    external_partner_id?: string;
    source?: string;
    auto_verify_email?: boolean;
    send_welcome_email?: boolean;
    metadata?: {
        phone?: string;
        timezone?: string;
        locale?: string;
    };
}

export interface ProvisionUserResponse {
    user_id: string;
    id: string;
    email: string;
    status: string;
    message: string;
    existing?: boolean;
    verified?: boolean;
    verification_url?: string;
}

@Injectable()
export class ProvisionUserUseCase {
    private readonly logger = new Logger(ProvisionUserUseCase.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(request: ProvisionUserRequest): Promise<Result<ProvisionUserResponse, Error>> {
        try {
            this.logger.debug(`Provisioning user with email: ${request.email}`);

            // 1. Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(request.email)) {
                return failure(new Error('invalid_email: The email address is not valid'));
            }

            // 2. Check if user already exists
            const existingUser = await this.userRepository.findByEmail(request.email);
            if (existingUser) {
                this.logger.log(`User already exists: ${existingUser.idValue}`);
                return success({
                    user_id: existingUser.idValue,
                    id: existingUser.idValue,
                    existing: true,
                    email: existingUser.emailValue,
                    verified: existingUser.isActiveValue,
                    status: existingUser.isActiveValue ? 'active' : 'inactive',
                    message: 'User already exists',
                });
            }

            // 3. Parse name
            let firstName = request.first_name || '';
            let lastName = request.last_name || '';

            if (!firstName && !lastName && request.name) {
                const nameParts = request.name.trim().split(' ');
                firstName = nameParts[0] || 'User';
                lastName = nameParts.slice(1).join(' ') || 'Provisioned';
            }

            if (!firstName) firstName = 'User';
            if (!lastName) lastName = 'Provisioned';

            // 4. Generate username from email
            const emailUsername = request.email.split('@')[0];
            const randomSuffix = crypto.randomBytes(4).toString('hex');
            let username = emailUsername;

            // Check if username exists
            const usernameExists = await this.userRepository.findByUsername(username);
            if (usernameExists) {
                username = `${emailUsername}_${randomSuffix}`;
            }

            // 5. Generate temporary password
            const temporaryPassword = crypto.randomBytes(16).toString('hex');

            // 6. Create user
            const newUser = await User.create({
                email: request.email,
                password: temporaryPassword,
                name: firstName,
                last_name: lastName,
                username: username,
            });

            // 7. Save user
            const savedUser = await this.userRepository.create(newUser);

            // 8. Generate verification token/URL
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationUrl = `${process.env.FRONTEND_URL || 'https://wheek.com'}/verify?token=${verificationToken}`;

            // TODO: Send welcome email if request.send_welcome_email is true
            // TODO: Send verification email if request.auto_verify_email is false

            this.logger.log(`User created: ${savedUser.idValue}, source: ${request.source || 'unknown'}`);

            return success({
                user_id: savedUser.idValue,
                id: savedUser.idValue,
                email: savedUser.emailValue,
                status: request.auto_verify_email ? 'active' : 'pending_verification',
                message: request.auto_verify_email
                    ? 'User created and verified.'
                    : 'User created. Email verification required.',
                verification_url: request.auto_verify_email ? undefined : verificationUrl,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error provisioning user: ${errorMessage}`);
            return failure(new Error('provisioning_failed: An error occurred creating the user'));
        }
    }
}

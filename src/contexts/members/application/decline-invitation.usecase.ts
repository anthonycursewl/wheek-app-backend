import { Injectable, Inject, UnauthorizedException, Logger } from "@nestjs/common";
import { Result, success, failure } from "../../shared/ROP/result";
import { NOTIFICATION_REPOSITORY, NotificationRepository } from "../domain/repos/notification.repository";
import { Notification } from "../domain/repos/notification.repository";
import { EMAIL_SERVICE } from "../../shared/infrastructure/email/interfaces/email.service.interface";
import { EmailService } from "../../shared/infrastructure/email/email.service";
import { USER_REPOSITORY, UserRepository } from "../../users/domain/repos/user.repository";

@Injectable()
export class DeclineInvitationUseCase {
    private readonly logger = new Logger(DeclineInvitationUseCase.name);

    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository,
        @Inject(EMAIL_SERVICE)
        private readonly emailService: EmailService,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository
    ) {}

    async execute(notification_id: string, user_id: string): Promise<Result<Notification, Error>> {
        try {
            // Step 1: Validate the invitation exists and is in a valid state
            const invitation = await this.notificationRepository.findById(notification_id);
            
            if (!invitation) {
                this.logger.warn(`Invitation not found: ${notification_id}`);
                throw new Error('Invitación invalida o no existe! Intente de nuevo.');
            }

            // Step 2: Check if invitation is still pending
            if (invitation.status !== 'PENDING') {
                this.logger.warn(`Invitation ${notification_id} is not PENDING, current status: ${invitation.status}`);
                throw new Error('Invitación ya no es valida! Intente de nuevo.');
            }

            // Step 4: Get the authenticated user details for authorization check
            const authenticatedUser = await this.userRepository.findById(user_id);
            if (!authenticatedUser) {
                this.logger.error(`Authenticated user not found: ${user_id}`);
                throw new Error('Usuario autenticado no encontrado');
            }

            // Step 5: Authorization check - ensure the user declining is the one who was invited (by email)
            if (authenticatedUser.emailValue !== invitation.email) {
                this.logger.warn(`Unauthorized decline attempt: User ${user_id} (${authenticatedUser.emailValue}) tried to decline invitation ${notification_id} sent to ${invitation.email}`);
                throw new UnauthorizedException('No tienes permisos para rechazar esta invitación');
            }

            // Step 6: Get the inviter user details for email notification
            const inviter = await this.userRepository.findById(invitation.invited_by.id);
            if (!inviter) {
                this.logger.error(`Inviter not found for invitation ${notification_id}: ${invitation.invited_by.id}`);
                throw new Error('Usuario invitador no encontrado');
            }

            // Step 7: Execute the decline operation in a transaction-like manner
            try {
                // Update the invitation status to DECLINED
                const declinedInvitation = await this.notificationRepository.denyNotification(notification_id);
                
                if (!declinedInvitation) {
                    this.logger.error(`Failed to decline invitation ${notification_id}`);
                    throw new Error('Error al actualizar el estado de la invitación');
                }

                // Step 8: Send email notification (non-critical, don't fail if email fails)
                if (inviter.emailValue) {
                    try {
                        await this.emailService.sendDeclineEmail(
                            inviter.emailValue,
                            declinedInvitation.store.name,
                            invitation.email,
                            `${inviter.nameValue} ${inviter.lastNameValue}`
                        );
                        this.logger.log(`Decline email sent to ${inviter.emailValue} for invitation ${notification_id}`);
                    } catch (emailError) {
                        // Log email error but don't fail the entire operation
                        this.logger.error(`Failed to send decline email for invitation ${notification_id}: ${emailError.message}`);
                        // Continue with the operation even if email fails
                    }
                }

                this.logger.log(`Invitation ${notification_id} successfully declined by user ${user_id}`);
                return success(declinedInvitation);

            } catch (operationError) {
                this.logger.error(`Operation failed for invitation ${notification_id}: ${operationError.message}`);
                throw operationError;
            }

        } catch (error) {
            this.logger.error(`Decline invitation failed for ${notification_id}: ${error.message}`);
            return failure(error);
        }
    }
}

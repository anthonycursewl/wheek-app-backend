import { Injectable, Inject } from "@nestjs/common";
import { MemberRepository } from "../domain/repos/member.repository";
import { Member } from "../domain/entities/Member";
import { Invitation } from "../domain/entities/Invitation";
import { Result, success, failure } from "../../shared/ROP/result";
import { MEMBER_REPOSITORY } from "../domain/repos/member.repository";
import { NotificationRepository } from "../domain/repos/notification.repository";
import { NOTIFICATION_REPOSITORY } from "../domain/repos/notification.repository";
import { USER_REPOSITORY, UserRepository } from "../../users/domain/repos/user.repository";

@Injectable()
export class AcceptInvitationUseCase {
    constructor(
        @Inject(MEMBER_REPOSITORY)
        private readonly memberRepository: MemberRepository,
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository
    ) {}

    async execute(notification_id: string, user_id: string) {
        try {
            const invitation = await this.notificationRepository.findById(notification_id);
            if (!invitation) return failure(new Error('Invitation not found'));

            const authenticatedUser = await this.userRepository.findById(user_id);
            if (!authenticatedUser) {
                throw new Error('Usuario autenticado no encontrado.');
            }

            if (authenticatedUser.emailValue !== invitation.email) {
                throw new Error('No tienes permisos para aceptar esta invitación.');
            }

            const acceptedInvitation = await this.notificationRepository.acceptNotification(notification_id, user_id);
            
            if (!acceptedInvitation) {
                throw new Error('Error al actualizar el estado de la invitación. Intenta de nuevo.');
            }

            return success(acceptedInvitation);
        } catch (error) {
            return failure(error);
        }
    }
        
}

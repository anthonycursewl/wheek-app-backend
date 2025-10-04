import { Module } from "@nestjs/common";
import { NotificationsController } from "./infrastructure/controllers/notification.controller";
import { GetAllNotificationsUseCase } from "./application/get-all-notis.usecase";
import { DeclineInvitationUseCase } from "./application/decline-invitation.usecase";
import { NotificationRepositoryAdapter } from "./infrastructure/adapters/notification.repository";
import { NOTIFICATION_REPOSITORY } from "./domain/repos/notification.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { EmailModule } from "../shared/infrastructure/email/email.module";
import { UserRepositoryAdapter } from "../users/infraestructure/adapters/user.repository";
import { USER_REPOSITORY } from "../users/domain/repos/user.repository";
import { AcceptInvitationUseCase } from "./application/accept-invitation.usecase";
import { MemberRepositoryAdapter } from "./infrastructure/adapters/member.repository";
import { MEMBER_REPOSITORY } from "./domain/repos/member.repository";

@Module({
    imports: [EmailModule],
    controllers: [NotificationsController],
    providers: [
        PrismaService,
        GetAllNotificationsUseCase,
        DeclineInvitationUseCase,
        AcceptInvitationUseCase,
        { provide:  
            NOTIFICATION_REPOSITORY, 
            useClass: NotificationRepositoryAdapter 
        },
        {
            provide: USER_REPOSITORY,
            useClass: UserRepositoryAdapter,
        },
        {
            provide: MEMBER_REPOSITORY,
            useClass: MemberRepositoryAdapter,
        }
    ],
})
export class NotificationModule {}
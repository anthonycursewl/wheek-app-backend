import { Module } from "@nestjs/common";
import { MemberController } from "./infrastructure/controllers/member.controller";
import { MemberRepositoryAdapter } from "./infrastructure/adapters/member.repository";
import { MEMBER_REPOSITORY } from "./domain/repos/member.repository";
import { GetAllMembersUseCase } from "./application/get-all-members.usecase";
import { InviteMemberUseCase } from "./application/invite-member.usecase";
import { AcceptInvitationUseCase } from "./application/accept-invitation.usecase";
import { DeclineInvitationUseCase } from "./application/decline-invitation.usecase";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { EmailModule } from "../shared/infrastructure/email/email.module";
import { EmailService } from "../shared/infrastructure/email/email.service";
import { StoreRepositoryAdapter } from "../stores/infraestructure/adapters/store.repository";
import { UserRepositoryAdapter } from "../users/infraestructure/adapters/user.repository";
import { RoleRepositoryAdapter } from "../stores/infraestructure/adapters/role.repository";
import { NotificationRepositoryAdapter } from "./infrastructure/adapters/notification.repository";
import { STORE_REPOSITORY } from "../stores/domain/repos/store.repository";
import { USER_REPOSITORY } from "../users/domain/repos/user.repository";
import { ROLE_REPOSITORY } from "../stores/domain/repos/role.repository";
import { NOTIFICATION_REPOSITORY } from "./domain/repos/notification.repository";

@Module({
    imports: [EmailModule],
    controllers: [MemberController],
    providers: [
        PrismaService,
        {
            provide: MEMBER_REPOSITORY,
            useClass: MemberRepositoryAdapter,
        },
        {
            provide: STORE_REPOSITORY,
            useClass: StoreRepositoryAdapter,
        },
        {
            provide: USER_REPOSITORY,
            useClass: UserRepositoryAdapter,
        },
        {
            provide: ROLE_REPOSITORY,
            useClass: RoleRepositoryAdapter,
        },
        {
            provide: NOTIFICATION_REPOSITORY,
            useClass: NotificationRepositoryAdapter,
        },
        GetAllMembersUseCase,
        InviteMemberUseCase,
        AcceptInvitationUseCase,
        DeclineInvitationUseCase
    ],
    exports: [],
})
export class MemberModule {}
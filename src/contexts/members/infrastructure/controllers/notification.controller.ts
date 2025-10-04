import { Body, Controller, Get, Param, Post, Query, UnauthorizedException } from "@nestjs/common";
import { GetAllNotificationsUseCase } from "../../application/get-all-notis.usecase";
import { CurrentUser } from "@/src/common/decorators/current-user.decorator";
import { JwtPayload } from "@/src/common/interfaces/jwt-payload.interface";
import { Result } from "@/src/contexts/shared/ROP/result";
import { Notification } from "../../domain/repos/notification.repository";
import { DeclineInvitationUseCase } from "../../application/decline-invitation.usecase";
import { AcceptInvitationUseCase } from "../../application/accept-invitation.usecase";

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly getAllNotificationsUseCase: GetAllNotificationsUseCase,
        private readonly declineInvitationUseCase: DeclineInvitationUseCase,
        private readonly acceptInvitationUseCase: AcceptInvitationUseCase
    ) {}

    @Get('get/all/:email')
    async getAllNotifications(
        @Query('skip') skip: string,
        @Query('take') take: string,
        @Param('email') email: string
    ): Promise<Result<Notification[], Error>> {
        const skipNumber = parseInt(skip, 10);
        const takeNumber = parseInt(take, 10);

        return await this.getAllNotificationsUseCase.execute(email, skipNumber, takeNumber);
    }
    
    @Post('reject/through/token')
    async rejectNotification(
        @Body() body: { notification_id: string },
        @CurrentUser() user: JwtPayload
    ) {
        const r = await this.declineInvitationUseCase.execute(body.notification_id, user.sub);
        if (!r.isSuccess) throw new UnauthorizedException(r.error.message);
        return r;
    }

    @Post('accept/through/token')
    async acceptNotification(
        @Body() body: { notification_id: string },
        @CurrentUser() user: JwtPayload
    ) {
        const r = await this.acceptInvitationUseCase.execute(body.notification_id, user.sub);
        if (!r.isSuccess) throw new UnauthorizedException(r.error.message);
        return r;
    }
}
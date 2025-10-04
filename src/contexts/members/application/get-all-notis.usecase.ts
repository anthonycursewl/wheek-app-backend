import { Inject, Injectable } from "@nestjs/common";
import { NOTIFICATION_REPOSITORY, NotificationRepository } from "../domain/repos/notification.repository";
import { Result, failure, success } from "../../shared/ROP/result";
import { Notification } from "../domain/repos/notification.repository";

@Injectable()
export class GetAllNotificationsUseCase {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository
    ) {}

    async execute(email: string, skip: number, take: number): Promise<Result<Notification[], Error>> {
        try {
            const notis = await this.notificationRepository.getAll(email, skip, take);
            return success(notis);
        } catch (error) {
            return failure(error);
        }
    }
}
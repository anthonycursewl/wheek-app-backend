export interface Notification {
    id: string;
    email: string;
    invited_by: {
        id: string;
        name: string;
        last_name: string;
    };
    store: {
        name: string;
        id: string;
    }
    role: {
        name: string;
        id: string;
    }
    token: string;
    status: string;
    created_at: Date;
    expires_at: Date;
}

export interface NotificationRepository {
    getAll(email: string, skip: number, take: number): Promise<Notification[]>
    findById(notification_id: string): Promise<Notification | null>
    denyNotification(notification_id: string): Promise<Notification>
    acceptNotification(notification_id: string, user_id: string): Promise<Notification>
}

export const NOTIFICATION_REPOSITORY = Symbol('NotificationRepository')
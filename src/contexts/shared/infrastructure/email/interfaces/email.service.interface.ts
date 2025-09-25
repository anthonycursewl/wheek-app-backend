export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface IEmailService {
    sendInvitationEmail(
        to: string,
        invitationToken: string,
        storeName: string,
        inviterName: string,
        roleName: string,
        frontendUrl?: string,
        message?: string
    ): Promise<void>;

    sendTestEmail(to: string): Promise<void>;

    verifyConnection(): Promise<boolean>;
}

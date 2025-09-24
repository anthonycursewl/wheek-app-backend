export interface IEmailService {
    sendInvitationEmail(
        to: string,
        invitationToken: string,
        storeName: string,
        inviterName: string,
        roleName: string,
        frontendUrl?: string
    ): Promise<void>;

    sendTestEmail(to: string): Promise<void>;

    verifyConnection(): Promise<boolean>;
}

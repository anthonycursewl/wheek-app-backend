export interface MemberRepository {
    getAll(store_id: string, skip: number, take: number, criteria?: any): Promise<any[] | []>
    inviteMember(data: {
        email: string;
        store_id: string;
        role_id: string;
        invited_by_id: string;
        token: string;
        expires_at: Date;
    }): Promise<any>
    findByEmailAndStore(email: string, store_id: string): Promise<any | null>
    findByToken(token: string): Promise<any | null>
    updateInvitationStatus(id: string, status: string): Promise<any>
}

export const MEMBER_REPOSITORY = Symbol('MemberRepository');
export interface MemberUser {
    name: string;
    last_name: string;
    username: string;
    email: string;
    icon_url?: string;
}

export interface MemberRole {
    id: string;
    name: string;
}

export class Member {
    id: string;
    user_id: string;
    store_id: string;
    role_id: string;
    is_active: boolean;
    created_at: Date;
    
    user: MemberUser;
    role: MemberRole;
}

export interface MemberWithDetails extends Member {
    permissions?: {
        id: string;
        resource: string;
        action: string;
        description?: string;
    }[];
}
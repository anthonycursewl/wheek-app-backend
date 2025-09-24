import { ApiProperty } from '@nestjs/swagger';

export class InvitationResponseDto {
    @ApiProperty({ description: 'Invitation UUID' })
    id: string;

    @ApiProperty({ description: 'Email of the invited user' })
    email: string;

    @ApiProperty({ description: 'Store UUID' })
    store_id: string;

    @ApiProperty({ description: 'Role UUID' })
    role_id: string;

    @ApiProperty({ description: 'User ID who sent the invitation' })
    invited_by_id: string;

    @ApiProperty({ description: 'Unique invitation token' })
    token: string;

    @ApiProperty({ 
        enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
        description: 'Invitation status'
    })
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

    @ApiProperty({ description: 'Creation timestamp' })
    created_at: Date;

    @ApiProperty({ description: 'Expiration timestamp' })
    expires_at: Date;

    @ApiProperty({ description: 'User who sent the invitation' })
    invited_by: {
        id: string;
        name: string;
        last_name: string;
        username: string;
        email: string;
    };

    @ApiProperty({ description: 'Role assigned to the invitation' })
    role: {
        id: string;
        name: string;
        description?: string;
    };

    @ApiProperty({ description: 'Store associated with the invitation' })
    store: {
        id: string;
        name: string;
        description?: string;
    };
}

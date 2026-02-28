import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LookupUserQueryDto {
    @ApiProperty({ description: 'Email to lookup', example: 'usuario@ejemplo.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ProvisionUserDto {
    @ApiProperty({ description: 'User email', example: 'nuevo@ejemplo.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'User full name', example: 'María García' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'First name', example: 'María', required: false })
    @IsOptional()
    @IsString()
    first_name?: string;

    @ApiProperty({ description: 'Last name', example: 'García', required: false })
    @IsOptional()
    @IsString()
    last_name?: string;

    @ApiProperty({ description: 'External partner user ID', example: 'malet_user_xyz789', required: false })
    @IsOptional()
    @IsString()
    external_partner_id?: string;

    @ApiProperty({ description: 'Source of the provisioning', example: 'malet_integration', required: false })
    @IsOptional()
    @IsString()
    source?: string;

    @ApiProperty({ description: 'Auto-verify email without sending verification', required: false })
    @IsOptional()
    @IsBoolean()
    auto_verify_email?: boolean;

    @ApiProperty({ description: 'Send welcome email to user', required: false })
    @IsOptional()
    @IsBoolean()
    send_welcome_email?: boolean;

    @ApiProperty({
        description: 'Additional metadata',
        required: false,
        example: { phone: '+1234567890', timezone: 'America/Caracas', locale: 'es' }
    })
    @IsOptional()
    @IsObject()
    metadata?: {
        phone?: string;
        timezone?: string;
        locale?: string;
    };
}

export class LookupUserResponseDto {
    @ApiProperty({ description: 'User ID' })
    user_id: string;

    @ApiProperty({ description: 'User ID (alias)' })
    id: string;

    @ApiProperty({ description: 'User email' })
    email: string;

    @ApiProperty({ description: 'User name' })
    name: string;

    @ApiProperty({ description: 'Whether email is verified' })
    verified: boolean;

    @ApiProperty({ description: 'Creation timestamp' })
    created_at: string;
}

export class ProvisionUserResponseDto {
    @ApiProperty({ description: 'User ID' })
    user_id: string;

    @ApiProperty({ description: 'User ID (alias)' })
    id: string;

    @ApiProperty({ description: 'User email' })
    email: string;

    @ApiProperty({ description: 'Account status' })
    status: string;

    @ApiProperty({ description: 'Status message' })
    message: string;

    @ApiProperty({ description: 'Whether user already existed', required: false })
    existing?: boolean;

    @ApiProperty({ description: 'Whether email is verified', required: false })
    verified?: boolean;

    @ApiProperty({ description: 'Email verification URL', required: false })
    verification_url?: string;
}

export class UserStatusResponseDto {
    @ApiProperty({ description: 'User ID' })
    user_id: string;

    @ApiProperty({ description: 'Whether email is verified' })
    email_verified: boolean;

    @ApiProperty({ description: 'Account status' })
    account_status: string;

    @ApiProperty({ description: 'Creation timestamp' })
    created_at: string;

    @ApiProperty({ description: 'Last login timestamp', nullable: true })
    last_login_at: string | null;
}

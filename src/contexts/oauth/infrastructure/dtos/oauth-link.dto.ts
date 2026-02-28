import { IsString, IsOptional, IsNotEmpty, IsEmail, IsUrl, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ===== Initiate Link Request =====
export class InitiateLinkQueryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'OAuth Client ID of the partner' })
    client_id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Redirect URI after linking' })
    redirect_uri: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'External user ID in the partner system' })
    external_user_id: string;

    @IsEmail()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Email of the user in the partner system' })
    external_email?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Name of the user in the partner system' })
    external_name?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'State parameter for CSRF protection' })
    state: string;
}

// ===== Consent Page Response =====
export class ConsentPageResponseDto {
    @ApiProperty()
    session_id: string;

    @ApiProperty()
    partner: {
        name: string;
        logo_url: string | null;
        description: string | null;
    };

    @ApiProperty()
    external_email: string;

    @ApiProperty()
    external_name: string;

    @ApiProperty()
    has_existing_account: boolean;

    @ApiProperty()
    permissions: string[];
}

// ===== Confirm Link Request =====
export class ConfirmLinkDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Session ID from the consent page' })
    session_id: string;

    @IsString()
    @IsOptional()
    @MinLength(8)
    @ApiPropertyOptional({ description: 'Password for new accounts (required if no existing account)' })
    password?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Name (optional, for new accounts)' })
    name?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Last name (optional, for new accounts)' })
    last_name?: string;
}

// ===== Confirm Link Response =====
export class ConfirmLinkResponseDto {
    @ApiProperty({ description: 'URL to redirect the user back to the partner app' })
    redirect_url: string;
}

// ===== Cancel Link Request =====
export class CancelLinkDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Session ID to cancel' })
    session_id: string;
}

// ===== Get User Token Request =====
export class GetUserTokenDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'External user ID in the partner system' })
    external_user_id: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Space-separated list of scopes (default uses partner default scopes)' })
    scope?: string;
}

// ===== Get User Token Response =====
export class GetUserTokenResponseDto {
    @ApiProperty()
    access_token: string;

    @ApiProperty()
    refresh_token: string;

    @ApiProperty()
    token_type: string;

    @ApiProperty()
    expires_in: number;

    @ApiProperty()
    scope: string;

    @ApiProperty()
    wheek_user_id: string;
}

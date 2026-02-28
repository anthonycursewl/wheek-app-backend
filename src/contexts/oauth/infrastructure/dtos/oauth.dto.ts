import { IsString, IsNotEmpty, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthorizeQueryDto {
    @ApiProperty({ description: 'OAuth client ID', example: 'malet_app_123' })
    @IsString()
    @IsNotEmpty()
    client_id: string;

    @ApiProperty({ description: 'Redirect URI after authorization', example: 'malet://integrations/callback' })
    @IsString()
    @IsNotEmpty()
    redirect_uri: string;

    @ApiProperty({ description: 'Response type, must be "code"', example: 'code' })
    @IsString()
    @IsNotEmpty()
    response_type: string;

    @ApiProperty({ description: 'Space-separated list of scopes', example: 'profile email read:orders' })
    @IsString()
    @IsNotEmpty()
    scope: string;

    @ApiProperty({ description: 'Anti-CSRF state token', example: 'abc123xyz789' })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({ description: 'PKCE code challenge', required: false })
    @IsOptional()
    @IsString()
    code_challenge?: string;

    @ApiProperty({ description: 'PKCE code challenge method (S256 or plain)', required: false })
    @IsOptional()
    @IsString()
    code_challenge_method?: string;
}

export class TokenRequestDto {
    @ApiProperty({ description: 'Grant type', example: 'authorization_code', enum: ['authorization_code', 'refresh_token'] })
    @IsString()
    @IsNotEmpty()
    grant_type: string;

    @ApiProperty({ description: 'OAuth client ID', example: 'malet_app_123' })
    @IsString()
    @IsNotEmpty()
    client_id: string;

    @ApiProperty({ description: 'OAuth client secret', example: 'secret_xxx' })
    @IsString()
    @IsNotEmpty()
    client_secret: string;

    @ApiProperty({ description: 'Redirect URI (required for authorization_code grant)', required: false })
    @IsOptional()
    @IsString()
    redirect_uri?: string;

    @ApiProperty({ description: 'Authorization code (required for authorization_code grant)', required: false })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ description: 'PKCE code verifier', required: false })
    @IsOptional()
    @IsString()
    code_verifier?: string;

    @ApiProperty({ description: 'Refresh token (required for refresh_token grant)', required: false })
    @IsOptional()
    @IsString()
    refresh_token?: string;
}

export class TokenResponseDto {
    @ApiProperty({ description: 'Access token' })
    access_token: string;

    @ApiProperty({ description: 'Token type, always "Bearer"' })
    token_type: string;

    @ApiProperty({ description: 'Token expiration time in seconds' })
    expires_in: number;

    @ApiProperty({ description: 'Refresh token' })
    refresh_token: string;

    @ApiProperty({ description: 'Granted scopes' })
    scope: string;
}

export class RevokeRequestDto {
    @ApiProperty({ description: 'OAuth client ID', example: 'malet_app_123' })
    @IsString()
    @IsNotEmpty()
    client_id: string;

    @ApiProperty({ description: 'OAuth client secret', example: 'secret_xxx' })
    @IsString()
    @IsNotEmpty()
    client_secret: string;

    @ApiProperty({ description: 'Access token or refresh token to revoke' })
    @IsString()
    @IsNotEmpty()
    token: string;
}

export class RevokeResponseDto {
    @ApiProperty({ description: 'Whether the token was revoked' })
    revoked: boolean;
}

export class OAuthErrorDto {
    @ApiProperty({ description: 'Error code' })
    error: string;

    @ApiProperty({ description: 'Error description' })
    error_description?: string;
}

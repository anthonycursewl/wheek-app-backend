import { Type, Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email of the user to invite',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role ID to assign to the invited member',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  role_id: string;

  @ApiProperty({
    description: 'Custom message to include in the invitation',
    example: 'Please join our store team!',
    required: false
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'Expiration date for the invitation (in ISO format)',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  expires_at?: Date;

  @ApiProperty({
    description: 'Initial status of the invitation',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
    required: false
  })
  @IsEnum(InviteStatus)
  @IsOptional()
  status?: InviteStatus = InviteStatus.PENDING;
}

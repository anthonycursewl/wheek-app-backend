import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTestEmailDto {
    @ApiProperty({
        description: 'Email address to send the test email',
        example: 'test@example.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

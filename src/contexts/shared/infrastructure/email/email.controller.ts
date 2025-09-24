import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendTestEmailDto } from './dto/send-test-email.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @Post('test')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send a test email' })
    @ApiResponse({ 
        status: 200, 
        description: 'Test email sent successfully'
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Failed to send test email'
    })
    async sendTestEmail(@Body() sendTestEmailDto: SendTestEmailDto) {
        await this.emailService.sendTestEmail(sendTestEmailDto.email);
        return { message: 'Test email sent successfully' };
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify SMTP connection' })
    @ApiResponse({ 
        status: 200, 
        description: 'SMTP connection verified'
    })
    async verifyConnection() {
        const isConnected = await this.emailService.verifyConnection();
        return { 
            connected: isConnected,
            message: isConnected ? 'SMTP connection verified successfully' : 'SMTP connection failed'
        };
    }
}

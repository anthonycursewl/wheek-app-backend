import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EMAIL_SERVICE } from './interfaces/email.service.interface';

@Module({
    controllers: [EmailController],
    providers: [
        EmailService,
        {
            provide: EMAIL_SERVICE,
            useClass: EmailService,
        },
    ],
    exports: [EmailService, EMAIL_SERVICE],
})
export class EmailModule {}

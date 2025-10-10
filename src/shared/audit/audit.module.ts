import { Module, Global, forwardRef } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from '@shared/persistance';

@Global()
@Module({
imports: [forwardRef(() => PrismaModule)],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}

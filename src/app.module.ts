import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@users/auth.module';
import { UserModule } from './contexts/users/user.module';
import { StoresModule } from './contexts/stores/stores.module';
import { ProductsModule } from './contexts/products/products.module';
import { RbacModule } from './common/rbac/rbac.module';
import { PrismaModule } from '@shared/persistance';
import { ReceptionsModule } from './contexts/receptions/receptions.module';
import { InventoryModule } from './contexts/inventory/inventory.module';
import { MemberModule } from './contexts/members/member.module';
import { EmailModule } from './contexts/shared/infrastructure/email/email.module';
import { NotificationModule } from './contexts/members/notification.module';
import { AuditModule } from './shared/audit/audit.module';
import { OAuthModule } from './contexts/oauth/oauth.module';

@Module({
  imports: [
    // Config module - must be first to load env variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core modules
    PrismaModule,
    RbacModule,
    AuditModule,

    // Feature modules
    AuthModule,
    UserModule,
    StoresModule,
    ProductsModule,
    ReceptionsModule,
    InventoryModule,
    MemberModule,
    EmailModule,
    NotificationModule,
    OAuthModule, // OAuth 2.0 integration module
  ],
  controllers: [],
  providers: [],
  exports: [PrismaModule],
})
export class AppModule { }


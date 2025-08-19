import { Module } from '@nestjs/common';
import { AuthModule } from '@users/auth.module';
import { UserModule } from './contexts/users/user.module';
import { StoresModule } from './contexts/stores/stores.module';
import { ProductsModule } from './contexts/products/products.module';
import { RbacModule } from './common/rbac/rbac.module';
import { PrismaModule } from '@shared/persistance';

@Module({
  imports: [
    // Core modules
    PrismaModule,
    RbacModule,
    
    // Feature modules
    AuthModule, 
    UserModule, 
    StoresModule, 
    ProductsModule,
  ],
  controllers: [],
  providers: [],
  exports: [PrismaModule],
})
export class AppModule {}

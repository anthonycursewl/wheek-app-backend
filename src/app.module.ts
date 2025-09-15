import { Module } from '@nestjs/common';
import { AuthModule } from '@users/auth.module';
import { UserModule } from './contexts/users/user.module';
import { StoresModule } from './contexts/stores/stores.module';
import { ProductsModule } from './contexts/products/products.module';
import { RbacModule } from './common/rbac/rbac.module';
import { PrismaModule } from '@shared/persistance';
import { ReceptionsModule } from './contexts/receptions/receptions.module';
import { InventoryModule } from './contexts/inventory/inventory.module';

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
    ReceptionsModule,
    InventoryModule
  ],
  controllers: [],
  providers: [],
  exports: [PrismaModule],
})
export class AppModule {}

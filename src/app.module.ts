import { Module } from '@nestjs/common';  
import { AuthModule } from '@users/auth.module';
import { UserModule } from './contexts/users/user.module';
import { StoresModule } from './contexts/stores/stores.module';
@Module({
  imports: [AuthModule, UserModule, StoresModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

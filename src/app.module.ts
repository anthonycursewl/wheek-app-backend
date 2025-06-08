import { Module } from '@nestjs/common';  
import { AuthModule } from '@users/auth.module';
import { UserModule } from './contexts/users/user.module';
@Module({
  imports: [AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';  
import { AuthModule } from '@users/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

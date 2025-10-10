import { Module } from '@nestjs/common';
import { UserController } from './infraestructure/controllers/user.controller';
import { UserUseCase } from './application/user.usecase';
import { VerifyUseCase } from './application/verify.usecase';
import { UserRepositoryAdapter } from './infraestructure/adapters/user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserUseCase,
    VerifyUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryAdapter,
    },
],
  exports: [UserUseCase],
})
export class UserModule {}

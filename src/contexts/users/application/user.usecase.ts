import { Injectable } from '@nestjs/common';
import { failure, success, Result } from '@shared/ROP/result';
import { UserRepository } from '@users/domain/repos/user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';
import { Inject } from '@nestjs/common';
import { User } from '@users/domain/entitys/user.entity';


@Injectable()
export class UserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<Result<User, Error>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return failure(new Error('User not found'));
      }

      return success(user);    
    } catch (error) {
      return failure(error as Error);
    }
  }
} 
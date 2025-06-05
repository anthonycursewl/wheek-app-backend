import { Injectable } from '@nestjs/common';
import { failure, success, Result } from '@shared/ROP/result';
import { UserRepository } from '@users/domain/repos/user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@users/domain/entitys/user.entity';
import { UserRole, UserRoleEnum } from '@users/domain/value-objects/user-role.vo';
import { Transaction } from '@shared/persistance/transactions';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(email: string, password: string, name: string, last_name: string, username: string, tx?: Transaction): Promise<Result<User, Error>> {
    try {
      const existingUser = await this.userRepository.findByEmail(email, tx);
      if (existingUser) {
        return failure(new Error('Email already exists'));
      }

      const salt = 10;
      const salted = bcrypt.genSaltSync(salt);
      const hashedPassword = bcrypt.hashSync(password, salted);
      const user = User.create({
        email,
        password: hashedPassword,
        role: UserRole.create(UserRoleEnum.USER),
        name, 
        last_name,
        username,
      });

      const createdUser = await this.userRepository.create(user, tx);
      return success(createdUser);
    } catch (error) {
      return failure(error);
    }
  }
} 
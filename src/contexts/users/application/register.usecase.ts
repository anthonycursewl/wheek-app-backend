import { Injectable } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { UserRepository } from '@users/domain/repos/user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';
import { Inject } from '@nestjs/common';
import { User } from '@users/domain/entitys/user.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string, name: string, last_name: string, username: string, tx?: Transaction): Promise<Result<{ access_token: string, refresh_token: string }, Error>> {
    try {
      const existingUser = await this.userRepository.findByEmail(email, tx);
      if (existingUser) {
        return failure(new Error('Email already exists'));
      }

      const existingUsername = await this.userRepository.findByUsername(username, tx);
      if (existingUsername) {
        return failure(new Error('Username already exists'));
      }

      const user = await User.create({
        email,
        password,
        name, 
        last_name,
        username,
      });

      const createdUser = await this.userRepository.create(user, tx);
      const payload = {
        email: createdUser.emailValue, 
        sub: createdUser.idValue,
      };

      const access_token = this.jwtService.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRATION, secret: process.env.JWT_ACCESS_SECRET });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRATION, secret: process.env.JWT_REFRESH_SECRET });
      return success({ access_token, refresh_token });
    } catch (error) {
      return failure(error);
    }
  }
} 
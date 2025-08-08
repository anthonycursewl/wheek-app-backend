import { Injectable } from '@nestjs/common';
import { failure, success, Result } from '@shared/ROP/result';
import { UserRepository } from '@users/domain/repos/user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Transaction } from '@shared/persistance/transactions';
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string, ref?: string, tx?: Transaction): Promise<Result<{ access_token: string, refresh_token: string }, Error>> {
    try {
      const user = await this.userRepository.findByEmail(email, tx);
      if (!user) {
        return failure(new Error('Invalid credentials'));
      }

      if (user && ref === 'email') {
        return success({
          access_token: '',
          refresh_token: '',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.getPassword());
      if (!isValidPassword) {
        return failure(new Error('Invalid credentials'));
      }

      const payload = { 
        email: user.getEmail(), 
        sub: user.getId(),
        role: user.getRole().getValue() 
      };
      
      const access_token = this.jwtService.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRATION, secret: process.env.JWT_ACCESS_SECRET });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRATION, secret: process.env.JWT_REFRESH_SECRET });
      return success({ access_token, refresh_token });
    } catch (error) {
      return failure(error as Error);
    }
  }
} 
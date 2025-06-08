import { Controller, Post, Body, UnauthorizedException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/login.usecase';
import { RegisterUseCase } from '../../application/register.usecase';
import { VerifyUseCase } from '../../application/verify.usecase';
import { Result } from '@shared/ROP/result';
import { Request } from 'express';

class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;
  @ApiProperty({ example: 'password123' })
  password: string;
}

class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;
  @ApiProperty({ example: 'password123' })
  password: string;
  @ApiProperty({ example: 'name' })
  name: string;
  @ApiProperty({ example: 'last_name' })
  last_name: string;
  @ApiProperty({ example: 'username' })
  username: string;
}

class VerifyDto {
  @ApiProperty({ example: 'token123' })
  token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyUseCase: VerifyUseCase,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ref = req.query.ref as string;

    /*
      Note: I gotta avoid magic strings here but for this case I'mma set it up like 
      this.
    */
    if (!ref) {
      throw new UnauthorizedException('Ref is required ?ref=email or ref=password');
    }

    if (ref === 'email') {
      if (!loginDto?.email) {
        throw new UnauthorizedException('Email is required');
      }
    }
    
    if (ref === 'password') {
      if (!loginDto?.email || !loginDto?.password) {
        throw new UnauthorizedException('Email and password are required');
      }
    }

    if (ref !== 'email' && ref !== 'password') {
      throw new UnauthorizedException('Ref must be email or password');
    }

    if (ref === 'email') {
      const result = await this.loginUseCase.execute(loginDto.email, loginDto.password, ref);
        if (!result.isSuccess) {
          throw new UnauthorizedException(result.error.message);
        }

        return result.value;
    }

    if (ref === 'password') {
      const result = await this.loginUseCase.execute(loginDto.email, loginDto.password, ref);
        if (!result.isSuccess) {
          throw new UnauthorizedException(result.error.message);
        }
        
        return result.value;
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' }) 
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto?.email || !registerDto?.password || !registerDto?.name || !registerDto?.last_name || !registerDto?.username) {
      throw new UnauthorizedException('Email, password, name, last_name and username are required');
    }
    
    const result = await this.registerUseCase.execute(registerDto.email, registerDto.password, registerDto.name, registerDto.last_name, registerDto.username);
    if (!result.isSuccess) {
      throw new UnauthorizedException(result.error.message);
    }
    return result.value;
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify user' })
  @ApiResponse({ status: 200, description: 'User verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async verify(@Req() req: Request) {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Token is required');
    }
    
    const token = req.headers.authorization.split(' ')[1];
    const result = await this.verifyUseCase.execute(token, process.env.JWT_SECRET || '');
    if (!result.isSuccess) {
      throw new UnauthorizedException(result.error.message);
    }
    
    return result.value;
  }
} 
import { 
  Controller, 
  Post, 
  UnauthorizedException, 
  Req, 
  Logger, 
  BadRequestException, 
  InternalServerErrorException,
  Body,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { Public } from '@/src/common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/login.usecase';
import { RegisterUseCase } from '../../application/register.usecase';
import { VerifyUseCase } from '../../application/verify.usecase';
import { Request } from 'express';

import { IsEmail, IsString, MinLength, IsNotEmpty, Matches, IsOptional } from 'class-validator';

// Base DTO for login with email validation only
class EmailLoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;
}

// Full DTO for login with email and password
class PasswordLoginDto extends EmailLoginDto {
  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiProperty({ example: 'Nombre' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({ example: 'Apellido' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  last_name: string;

  @ApiProperty({ example: 'usuario123' })
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
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

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() body: any, @Req() req: Request) {
    const logger = new Logger('AuthController');
    const ref = req.query.ref as string;

    console.log(`${ref} | REF HERE`)

    try {
      logger.debug(`Login attempt with ref: ${ref}`, { email: body.email });

      if (!ref) {
        logger.warn('Login attempt without ref parameter');
        throw new BadRequestException('Se requiere el parámetro ref: ?ref=email o ?ref=password');
      }

      let validatedData;

      // Validate based on ref type
      if (ref === 'email') {
        // Validate as EmailLoginDto
        const emailDto = new EmailLoginDto();
        Object.assign(emailDto, body);
        
        const errors = await import('class-validator').then(m => m.validate(emailDto));
        if (errors.length > 0) {
          const errorMessage = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
          throw new BadRequestException(errorMessage);
        }
        
        validatedData = emailDto;
      } else if (ref === 'password') {
        // Validate as PasswordLoginDto
        const passwordDto = new PasswordLoginDto();
        Object.assign(passwordDto, body);
        
        const errors = await import('class-validator').then(m => m.validate(passwordDto));
        if (errors.length > 0) {
          const errorMessage = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
          throw new BadRequestException(errorMessage);
        }
        
        validatedData = passwordDto;
      } else {
        logger.warn(`Invalid ref parameter: ${ref}`);
        throw new BadRequestException('Tipo de autenticación no válido');
      }

      // Execute login use case
      const result = await this.loginUseCase.execute(
        validatedData.email, 
        (validatedData as any).password, 
        ref
      );
      
      if (!result.isSuccess) {
        logger.warn(`Login failed: ${result.error.message}`, { email: validatedData.email, ref });
        throw new UnauthorizedException('Credenciales inválidas');
      }

      logger.log(`Login successful for user: ${validatedData.email}`);
      return result.value;
      
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      logger.error('Error during login', error.stack);
      throw new InternalServerErrorException('Ocurrió un error al iniciar sesión');
    }
  }

  @Public()
  @Post('save')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Register a new user' }) 
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() registerDto: RegisterDto) {
    
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
    const secret = process.env.JWT_ACCESS_SECRET || '';
    const result = await this.verifyUseCase.execute(token, secret);
    if (!result.isSuccess) {
      throw new UnauthorizedException(result.error.message);
    }
    
    return result.value;
  }
} 
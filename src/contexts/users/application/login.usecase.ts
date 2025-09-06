import { Injectable, Logger } from '@nestjs/common';
import { failure, success, Result } from '@/src/contexts/shared/ROP/result';
import { UserRepository } from '@users/domain/repos/user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string, ref?: string, tx?: Transaction): Promise<Result<{ access_token: string, refresh_token: string }, Error>> {
    try {
      this.logger.debug(`Buscando usuario con email: ${email}`);
      const user = await this.userRepository.findByEmail(email, tx);
      
      if (!user) {
        this.logger.warn(`Intento de inicio de sesión fallido: usuario con email ${email} no encontrado`);
        return failure(new Error('Credenciales inválidas'));
      }

      if (ref === 'email') {
        this.logger.debug(`Validación de email exitosa para: ${email}`);
        return success({
          access_token: '',
          refresh_token: '',
        });
      }

      this.logger.debug(`Validando contraseña para usuario: ${email}`);
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        this.logger.warn(`Intento de inicio de sesión fallido: contraseña incorrecta para el usuario ${email}`);
        return failure(new Error('Credenciales inválidas'));
      }

      const payload = { 
        email: user.emailValue, 
        sub: user.idValue, 
      };
      
      const access_token = this.jwtService.sign(
        payload, 
        { 
          expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m', 
          secret: process.env.JWT_ACCESS_SECRET || 'default_secret'
        }
      );
      
      const refresh_token = this.jwtService.sign(
        payload, 
        { 
          expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d', 
          secret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
        }
      );
      
      this.logger.log(`Inicio de sesión exitoso para el usuario: ${email}`);
      return success({ access_token, refresh_token });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error en el proceso de autenticación: ${errorMessage}`, error instanceof Error ? error.stack : '');
      return failure(new Error('Ocurrió un error al procesar la solicitud de inicio de sesión'));
    }
  }
}
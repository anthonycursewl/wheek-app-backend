import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FastifyRequest as Request, FastifyReply as Response } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    
    const { ip, method, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const originalUrl = req.url;
    const now = Date.now();

    // Log de la petición entrante
    this.logger.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} - User Agent: ${userAgent} - IP: ${ip}`,
    );

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        // Log de la respuesta exitosa
        this.logger.log(
          `[${new Date().toISOString()}] ${method} ${originalUrl} - Status: ${res.statusCode} - ${responseTime}ms`,
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        // Log de errores
        this.logger.error(
          `[${new Date().toISOString()}] ${method} ${originalUrl} - Error: ${error.message} - ${responseTime}ms`,
          error.stack,
        );
        return throwError(() => error);
      }),
    );
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyReply } from 'fastify';
import { Result } from '@/src/contexts/shared/ROP/result';

@Injectable()
export class PdfResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result: Result<Buffer, Error>) => {
        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse<FastifyReply>();

        if (result && result.isSuccess) {
          const pdfBuffer = result.value;
          
          response.header('Content-Type', 'application/pdf');
          response.header(
            'Content-Disposition',
            `attachment; filename="report.pdf"`
          );
          response.header('Content-Length', pdfBuffer.length);
          
          return pdfBuffer
        }

        return result;
      }),
    );
  }
}

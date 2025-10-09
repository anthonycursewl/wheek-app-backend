import { NotFoundException, UnauthorizedException, ForbiddenException, BadRequestException, InternalServerErrorException, HttpException } from '@nestjs/common'
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { FastifyRequest as Request, FastifyReply as Response } from 'fastify';

const errorCodes = {    
    [NotFoundException.name]: 404,
    [UnauthorizedException.name]: 401,
    [ForbiddenException.name]: 403,
    [BadRequestException.name]: 400,
    [InternalServerErrorException.name]: 500,
};

@Catch()
export class DefaultExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string | string[] | object; // Allow message to be a string or array of strings
    let errorName: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && 'message' in response) {
        message = (response as any).message; // Extract detailed message from HttpException response
      } else {
        message = exception.message;
      }
      errorName = exception.name;
    } else {
      status = errorCodes[exception.name];
      message = exception.message;
      errorName = exception.name;

      if (!status) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        errorName = exception.name;
        Logger.error(exception);
      }
    }

    if (typeof message === 'string' && message.includes('prisma') && request.url.includes('stores')) {
      message = 'Wheek | Ha ocurrido un error. Verifica la información enviada. Asegurate que el store_id sea correcto.';
    }

    const errorResponsePayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      error: errorName,
    };
    response.status(status).send(errorResponsePayload);
    const ip =
      (request.headers['x-forwarded-for'] as string) ||
      (request.socket.remoteAddress as string);

    Logger.error(
      status + ': ' + 'Error ' + errorName + ' ' + message + ' from ' + ip,
    );
  }
}

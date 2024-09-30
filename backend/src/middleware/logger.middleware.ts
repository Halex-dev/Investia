// src/logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`Request URL: ${req.originalUrl}`);
    this.logger.debug(`Request Method: ${req.method}`);
    this.logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    next();
  }
}

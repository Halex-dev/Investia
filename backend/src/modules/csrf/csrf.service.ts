import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
  private secret = crypto.randomBytes(16).toString('hex');

  generateToken(): string {
    const generateToken = crypto
      .createHmac('sha256', this.secret)
      .update(crypto.randomBytes(16))
      .digest('hex');
    return generateToken;
  }

  validateToken(token: string): boolean {
    const expectedToken = crypto.createHmac('sha256', this.secret).update(token).digest('hex');

    console.log('Token cliente: ', token, 'token generato:', expectedToken);
    return token === expectedToken;
  }
}

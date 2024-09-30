import { Controller, Get, Req, Res } from '@nestjs/common';
import { CsrfService } from './csrf.service';

@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get()
  getCsrfToken(@Req() req, @Res() res) {
    const token = this.csrfService.generateToken();
    res.cookie('XSRF-TOKEN', token, { httpOnly: false, sameSite: 'strict' });
    res.json({ csrfToken: token });
  }
}

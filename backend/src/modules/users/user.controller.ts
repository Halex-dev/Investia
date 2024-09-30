import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../shared/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('update')
  async updateUser(@User('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUser(userId, updateUserDto);
  }
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(RegisterDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: RegisterDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(RegisterDto.password, 10);
    const user = this.usersRepository.create({
      email: RegisterDto.email,
      password: hashedPassword,
      username: RegisterDto.username,
    });

    return this.usersRepository.save(user);
  }

  async findOne(identifier: string): Promise<User> {
    let user: User | null;

    // Verifica se l'identificatore è un UUID valido
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

    if (isUUID) {
      user = await this.usersRepository.findOne({ where: { id: identifier } });
    } else {
      user = await this.usersRepository.findOne({
        where: [{ email: identifier }, { username: identifier }],
      });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateMonthStartDay(userId: string, monthStartDay: number): Promise<User> {
    const user = await this.findById(userId);
    user.monthStartDay = monthStartDay;
    return this.usersRepository.save(user);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Aggiorna solo i campi forniti
    if (updateUserDto.username !== undefined) user.username = updateUserDto.username;
    if (updateUserDto.monthStartDay !== undefined) user.monthStartDay = updateUserDto.monthStartDay;

    return this.usersRepository.save(user);
  }
}

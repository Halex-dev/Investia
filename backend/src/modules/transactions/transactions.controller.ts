import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Sse,
  Query,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { User } from '../../shared/decorators/user.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';

import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dot';

type SseMessageEvent = Pick<MessageEvent, 'data' | 'type' | 'lastEventId'>;

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private eventEmitter: EventEmitter2
  ) {}

  @Sse('sse')
  sse(@User() user: any): Observable<SseMessageEvent> {
    return new Observable(subscriber => {
      const listener = (event: any) => {
        if (event.userId === user.userId) {
          const messageEvent: SseMessageEvent = {
            data: event,
            type: 'message',
            lastEventId: Date.now().toString(),
          };
          subscriber.next(messageEvent);
        }
      };

      this.eventEmitter.on('transaction.created', listener);

      return () => {
        this.eventEmitter.removeListener('transaction.created', listener);
      };
    });
  }

  @Get()
  async findAll(
    @User('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<Transaction[]> {
    return this.transactionsService.findAll(userId, new Date(startDate), new Date(endDate));
  }

  @Post()
  async create(
    @User('id') userId: string,
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Put(':id')
  async update(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ): Promise<Transaction> {
    console.log(updateTransactionDto);
    console.log(id);
    console.log(userId);
    return this.transactionsService.update(id, userId, updateTransactionDto);
  }

  @Delete(':id')
  async delete(@User('id') userId: string, @Param('id') id: string): Promise<void> {
    return this.transactionsService.delete(id, userId);
  }
}

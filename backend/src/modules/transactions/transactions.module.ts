import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './transaction.entity';
import { RecurringTransactionService } from './recurring-transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [TransactionsService, RecurringTransactionService],
  controllers: [TransactionsController],
  exports: [RecurringTransactionService],
})
export class TransactionsModule {}

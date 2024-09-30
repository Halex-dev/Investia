import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { Transaction } from '@/modules/transactions/transaction.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';

@Injectable()
export class RecurringTransactionService {
  private readonly logger = new Logger(RecurringTransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
  ) {}

  async runAllChecks() {
    await this.handleRecurringTransactions();
    await this.handleAmortizedTransactions();
    await this.adjustForUserDefinedMonthStart();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurringTransactions() {
    this.logger.log('Handling recurring transactions');
    const today = new Date();
    const recurringTransactions = await this.transactionsRepository.find({
      where: { isRecurring: true },
    });

    for (const transaction of recurringTransactions) {
      if (this.shouldCreateTransaction(transaction, today)) {
        await this.createRecurringTransaction(transaction, today);
      }
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleAmortizedTransactions() {
    this.logger.log('Handling amortized transactions');
    const today = new Date();
    const amortizedTransactions = await this.transactionsRepository.find({
      where: {
        isAmortized: true,
        fatherId: IsNull(),
      },
    });

    for (const transaction of amortizedTransactions) {
      await this.createAmortizedTransaction(transaction, today);
    }
  }

  private shouldCreateTransaction(transaction: Transaction, today: Date): boolean {
    const lastOccurrence = moment(transaction.date);
    const currentDate = moment(today);

    switch (transaction.recurringFrequency) {
      case 'daily':
        return true;
      case 'weekly':
        return currentDate.diff(lastOccurrence, 'weeks') >= 1;
      case 'monthly':
        return currentDate.diff(lastOccurrence, 'months') >= 1;
      case 'yearly':
        return currentDate.diff(lastOccurrence, 'years') >= 1;
      default:
        return false;
    }
  }

  private async createRecurringTransaction(transaction: Transaction, today: Date) {
    const newTransaction = this.transactionsRepository.create({
      ...transaction,
      id: undefined,
      date: today,
    });

    await this.transactionsRepository.save(newTransaction);
    this.logger.log(`Created recurring transaction: ${newTransaction.id}`);

    // Aggiorna la data dell'ultima occorrenza
    await this.transactionsRepository.update(transaction.id, { date: today });
  }

  private async createAmortizedTransaction(transaction: Transaction, today: Date) {
    const createdTransactions = await this.transactionsRepository.count({
      where: { fatherId: transaction.id },
    });

    if (createdTransactions < transaction.amortizationMonths - 1) {
      const newTransaction = this.transactionsRepository.create({
        ...transaction,
        id: undefined,
        date: today,
        description: `Amortization (${createdTransactions + 2}/${transaction.amortizationMonths}): ${transaction.description}`,
        fatherId: transaction.id,
      });

      await this.transactionsRepository.save(newTransaction);
      this.logger.log(`Created amortized transaction: ${newTransaction.id}`);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async adjustForUserDefinedMonthStart() {
    this.logger.log('Adjusting for user-defined month start');

    // otteniamo tutti gli userId distinti dalle transazioni
    const userIds = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('transaction.userId')
      .distinct(true)
      .getRawMany();

    // per ogni userId, otteniamo il monthStartDay
    for (const { userId } of userIds) {
      const user = await this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('user.monthStartDay', 'monthStartDay')
        .innerJoin('transaction.user', 'user')
        .where('transaction.userId = :userId', { userId })
        .getRawOne();

      if (user && user.monthStartDay !== 1) {
        const lastMonthEnd = moment().subtract(1, 'day').startOf('day');
        const userMonthStart = moment().date(user.monthStartDay).startOf('day');

        if (userMonthStart.isAfter(lastMonthEnd)) {
          userMonthStart.subtract(1, 'month');
        }

        await this.transactionsRepository.update(
          {
            userId: userId,
            date: LessThanOrEqual(userMonthStart.toDate()),
          },
          { date: userMonthStart.toDate() }
        );
      }
    }
  }
}

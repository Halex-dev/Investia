import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dot';
import { Decimal } from 'decimal.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
  ) {}

  async findAll(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      relations: ['category'],
      order: { date: 'DESC' },
    });
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    let transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      userId,
    });

    if (transaction.isAmortized && transaction.amortizationMonths > 0) {
      const totalAmount = new Decimal(transaction.amount);
      const amortizedAmount = this.calculateAmortizedAmount(
        totalAmount,
        transaction.amortizationMonths
      );

      // Creiamo la prima transazione con l'importo ammortizzato
      transaction.amount = amortizedAmount;
      transaction.description = `Amortization (1/${transaction.amortizationMonths}): ${transaction.description}`;
      transaction = await this.transactionsRepository.save(transaction);

      // Creiamo le transazioni successive con lo stesso importo
      for (let i = 1; i < transaction.amortizationMonths; i++) {
        const nextDate = new Date(transaction.date);
        nextDate.setMonth(nextDate.getMonth() + i);

        await this.transactionsRepository.save({
          ...transaction,
          id: undefined,
          date: nextDate,
          description: `Amortization (${i + 1}/${transaction.amortizationMonths}): ${createTransactionDto.description}`,
          fatherId: transaction.id,
          amount: amortizedAmount, // Stesso importo della prima transazione
        });
      }
    } else {
      transaction = await this.transactionsRepository.save(transaction);
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto
  ): Promise<Transaction> {
    const existingTransaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });

    if (existingTransaction) {
      if (updateTransactionDto.isAmortized && updateTransactionDto.amortizationMonths > 0) {
        // Se la transazione diventa ammortizzata o cambia i dettagli dell'ammortizzazione
        if (
          !existingTransaction.isAmortized ||
          existingTransaction.amortizationMonths !== updateTransactionDto.amortizationMonths ||
          new Decimal(existingTransaction.amount)
            .times(existingTransaction.amortizationMonths)
            .toNumber() !== new Decimal(updateTransactionDto.amount).toNumber()
        ) {
          // Eliminiamo tutte le transazioni figlie esistenti
          await this.transactionsRepository.delete({ fatherId: id });

          const totalAmount = new Decimal(updateTransactionDto.amount);
          const amortizedAmount = this.calculateAmortizedAmount(
            totalAmount,
            updateTransactionDto.amortizationMonths
          );

          // Aggiorniamo la transazione principale
          await this.transactionsRepository.update(
            { id, userId },
            {
              ...updateTransactionDto,
              amount: amortizedAmount,
              description: `Amortization (1/${updateTransactionDto.amortizationMonths}): ${updateTransactionDto.description}`,
            }
          );

          // Creiamo le nuove transazioni figlie
          for (let i = 1; i < updateTransactionDto.amortizationMonths; i++) {
            const nextDate = new Date(existingTransaction.date);
            nextDate.setMonth(nextDate.getMonth() + i);

            await this.transactionsRepository.save({
              ...existingTransaction,
              ...updateTransactionDto,
              id: undefined,
              date: nextDate,
              amount: amortizedAmount, // Stesso importo della transazione principale
              description: `Amortization (${i + 1}/${updateTransactionDto.amortizationMonths}): ${updateTransactionDto.description}`,
              fatherId: id,
            });
          }
        } else {
          // Se l'ammortizzazione non è cambiata, aggiorniamo solo questa transazione e le sue figlie
          const updateFields = {
            ...updateTransactionDto,
            amount: existingTransaction.amount, // Manteniamo l'importo originale
          };
          await this.transactionsRepository.update({ id, userId }, updateFields);
          await this.transactionsRepository.update({ fatherId: id }, updateFields);
        }
      } else {
        // Se la transazione non è più ammortizzata, eliminiamo tutte le transazioni figlie
        await this.transactionsRepository.delete({ fatherId: id });
        await this.transactionsRepository.update({ id, userId }, updateTransactionDto);
      }
    }

    return this.transactionsRepository.findOne({ where: { id, userId } });
  }

  async delete(id: string, userId: string): Promise<void> {
    // Eliminiamo tutte le transazioni figlie
    await this.transactionsRepository.delete({ fatherId: id });
    // Eliminiamo la transazione principale
    await this.transactionsRepository.delete({ id, userId });
  }

  private calculateAmortizedAmount(totalAmount: Decimal, amortizationMonths: number): Decimal {
    return totalAmount.dividedBy(amortizationMonths).toDecimalPlaces(2);
  }
}

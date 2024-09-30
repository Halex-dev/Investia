import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Decimal } from 'decimal.js';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  INVESTMENT = 'investment',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: Decimal | number | string): number => {
        if (value instanceof Decimal) {
          return value.toNumber();
        } else if (typeof value === 'number') {
          return value;
        } else if (typeof value === 'string') {
          return new Decimal(value).toNumber();
        }
        throw new Error('Invalid input for amount');
      },
      from: (value: string | number): Decimal => {
        return new Decimal(value);
      },
    },
  })
  amount: Decimal;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Category, category => category.transactions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Transaction, transaction => transaction.id)
  @JoinColumn({ name: 'fatherId' })
  fatherTransaction: number;

  @Column({ nullable: true })
  fatherId: string;

  @Column()
  categoryId: string;

  @Column({ nullable: true })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurringFrequency: string;

  @Column({ nullable: true })
  isAmortized: boolean;

  @Column({ nullable: true })
  amortizationMonths: number;
}

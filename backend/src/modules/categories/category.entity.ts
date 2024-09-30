import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';

export enum CategoryType {
  ESSENTIAL = 'essential',
  OPTIONAL = 'optional',
  SHORT_TERM_INVESTMENT = 'short_term_investment',
  LONG_TERM_INVESTMENT = 'long_term_investment',
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.OPTIONAL,
  })
  type: CategoryType;

  @ManyToOne(() => User, user => user.categories)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];
}

import { User } from './userPayload'

export enum CategoryType {
  ESSENTIAL = 'essential',
  OPTIONAL = 'optional',
  SHORT_TERM_INVESTMENT = 'short_term_investment',
  LONG_TERM_INVESTMENT = 'long_term_investment',
}

export interface Category {
  id: string
  name: string
  color: string
  type: CategoryType
  userId?: string
  user?: User
  //transactions: Transaction[];
}

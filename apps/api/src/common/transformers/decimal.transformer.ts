import Decimal from 'decimal.js';

export const DecimalTransformer = {
  to: (value: number): string => new Decimal(value).toFixed(2),
  from: (value: string): number => new Decimal(value).toNumber(),
};

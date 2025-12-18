import Decimal from 'decimal.js';

export const DecimalTransformer = {
  to: (value?: number | null): string | null => {
    if (value === null || value === undefined) return null;
    return new Decimal(value).toFixed(2);
  },
  from: (value?: string | null): number | null => {
    if (value === null || value === undefined) return null;
    return new Decimal(value).toNumber();
  },
};

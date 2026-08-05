'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type DateRange = {
  from: Date;
  to: Date;
};

type DateRangeContextType = {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  setPreset: (preset: 'week' | 'month' | 'quarter' | 'custom') => void;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const setPreset = (preset: 'week' | 'month' | 'quarter' | 'custom') => {
    const now = new Date();
    
    switch (preset) {
      case 'week':
        setDateRange({
          from: startOfWeek(now),
          to: endOfWeek(now),
        });
        break;
      case 'month':
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now),
        });
        break;
      case 'quarter':
        setDateRange({
          from: addDays(now, -90),
          to: now,
        });
        break;
      default:
        // custom - don't change
        break;
    }
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, setPreset }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}

import { format, parseISO } from 'date-fns';

export const formatDate = (date: string) => {
  return format(parseISO(date), 'MMM dd, yyyy');
};

export const getCurrentWeekDates = () => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return format(date, 'yyyy-MM-dd');
  });
};
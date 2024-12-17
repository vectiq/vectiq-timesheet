import { format } from 'date-fns';

interface HourInputProps {
  date: Date;
  value: string;
  onChange: (value: string) => void;
}

export function HourInput({ date, value, onChange }: HourInputProps) {
  const dateKey = format(date, 'yyyy-MM-dd');
  
  return (
    <div className="px-4 py-2">
      <input
        type="number"
        min="0"
        max="24"
        step="0.25"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-center"
        placeholder="0.00"
        aria-label={`Hours for ${format(date, 'EEEE, MMMM d')}`}
      />
    </div>
  );
}
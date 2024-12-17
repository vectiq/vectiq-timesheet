import { format } from 'date-fns';

interface Props {
  dates: Date[];
}

export function WeeklyTimesheetHeader({ dates }: Props) {
  return (
    <div className="grid grid-cols-[200px_150px_repeat(7,1fr)_100px] bg-gray-50">
      <div className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
        Project
      </div>
      <div className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
        Role
      </div>
      {dates.map((date) => (
        <div
          key={date.toISOString()}
          className="px-4 py-3 text-center text-sm font-semibold text-gray-900"
        >
          <div>{format(date, 'EEE')}</div>
          <div className="text-gray-500">{format(date, 'MMM d')}</div>
        </div>
      ))}
      <div className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
        <div>Total</div>
        <div className="text-gray-500">Hours</div>
      </div>
    </div>
  );
}
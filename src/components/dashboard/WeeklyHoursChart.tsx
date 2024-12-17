import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';

interface Props {
  data: Array<{ name: string; hours: number }>;
}

export function WeeklyHoursChart({ data }: Props) {
  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Hours</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
import { ReactNode } from 'react';
import { Label } from '@/components/ui/Label';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, id, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div>{children}</div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
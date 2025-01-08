import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/styles';

interface ForecastInputProps {
  value: number;
  isDefault: boolean;
  onChange: (value: number) => void;
}

export function ForecastInput({ value, isDefault, onChange }: ForecastInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (!isNaN(numValue) && numValue !== value) {
      onChange(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const numValue = parseFloat(localValue);
      if (!isNaN(numValue) && numValue !== value) {
        onChange(numValue);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setLocalValue(value.toString());
      setIsEditing(false);
    }
  };

  return isEditing ? (
    <input
      type="number"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-24 text-right rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      autoFocus
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "w-24 py-2 text-right cursor-pointer rounded hover:bg-gray-50 inline-block",
        isDefault && "text-gray-400 italic"
      )}
      title={isDefault ? "Default value based on working days" : undefined}
    >
      {value.toFixed(1)}
    </div>
  );
}
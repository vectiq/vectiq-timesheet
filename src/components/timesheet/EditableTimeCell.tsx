import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/styles';

interface EditableTimeCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  isDisabled?: boolean;
}

export function EditableTimeCell({ 
  value, 
  onChange,
  isEditing,
  onStartEdit,
  onEndEdit,
  isDisabled = false
}: EditableTimeCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState('');

  useEffect(() => {
    if (isEditing) {
      setLocalValue(value?.toString() || '');
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    }
  }, [isEditing, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setLocalValue(newValue);
    }
  };

  const handleBlur = () => {
    const numValue = localValue === '' ? null : parseFloat(localValue);
    if (numValue !== value) {
      onChange(numValue);
    }
    onEndEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const numValue = localValue === '' ? null : parseFloat(localValue);
      if (numValue !== value) {
        onChange(numValue);
      }
      onEndEdit();
    } else if (e.key === 'Escape') {
      setLocalValue(value?.toString() || '');
      onEndEdit();
    }
  };

  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    />
  ) : (
    <div
      onClick={isDisabled ? undefined : onStartEdit}
      className={cn(
        "w-16 py-2 text-center cursor-pointer rounded hover:bg-gray-50",
        value === null && "text-gray-400",
        isDisabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
      )}
    >
      {value?.toFixed(2) || '-'}
    </div>
  );
}
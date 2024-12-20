import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/styles';

interface EditableTimeCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export function EditableTimeCell({ 
  value, 
  onChange,
  isEditing,
  onStartEdit,
  onEndEdit
}: EditableTimeCellProps) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  const handleBlur = () => {
    const numValue = inputValue === '' ? null : parseFloat(inputValue);
    if (numValue !== value) {
      onChange(numValue);
    }
    onEndEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const numValue = inputValue === '' ? null : parseFloat(inputValue);
      if (numValue !== value) {
        onChange(numValue);
      }
      onEndEdit();
    } else if (e.key === 'Escape') {
      setInputValue(value?.toString() || '');
      onEndEdit();
    }
  };

  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    />
  ) : (
    <div
      onClick={onStartEdit}
      className={cn(
        "w-16 py-2 text-center cursor-pointer rounded hover:bg-gray-50",
        value === null && "text-gray-400"
      )}
    >
      {value?.toFixed(2) || '-'}
    </div>
  );
}
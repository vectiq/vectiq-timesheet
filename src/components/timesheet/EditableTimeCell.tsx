import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/styles';
import { Input } from '@/components/ui/Input';
import { Lock, Loader2 } from 'lucide-react';

interface EditableTimeCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  isDisabled?: boolean;
  isLocked?: boolean;
  isCommitting?: boolean;
  onTab?: (shift: boolean) => void;
  tooltip?: string;
  cellKey?: string;
}

export function EditableTimeCell({ 
  value, 
  onChange,
  isEditing,
  onStartEdit,
  onEndEdit,
  isDisabled = false,
  isLocked,
  isCommitting = false,
  onTab,
  tooltip,
  cellKey
}: EditableTimeCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setLocalValue(newValue);
    }
  };

  const handleSave = () => {
    const numValue = localValue === '' ? null : parseFloat(localValue);
    if (numValue !== value) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    handleSave();
    setIsFocused(false);
    onEndEdit();
  };

  const handleFocus = () => {
    if (!isDisabled && !isLocked) {
      setIsFocused(true);
      onStartEdit();
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
      onEndEdit();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setLocalValue(value?.toString() || '');
      onEndEdit();
      e.currentTarget.blur();
    } else if (e.key === 'Tab' && onTab) {
      handleSave();
      onEndEdit();
      onTab(e.shiftKey);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        aria-label="Time entry hours"
        type="text"
        data-cell-key={cellKey}
        value={localValue}
        disabled={isDisabled || isLocked || isCommitting}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className={cn(
          "text-center h-10 px-2 py-1",
          !isFocused && "bg-transparent border-transparent hover:border-gray-300 focus:border-indigo-500",
          value === null && "text-gray-400",
          isDisabled && "cursor-not-allowed opacity-50",
          isLocked && "bg-gray-50",
          isDisabled && tooltip && "bg-red-50/30",
          isCommitting && "text-transparent"
        )}
        title={isLocked ? `Time entries are locked` : tooltip}
      />
      {isCommitting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        </div>
      )}
    </div>
  );
}
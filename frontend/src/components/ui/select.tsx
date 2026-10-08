'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
  listboxId: string;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

function useSelect() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error('Select compound components must be rendered inside <Select>');
  }
  return ctx;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Select({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  disabled = false,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const listboxId = React.useId();

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (newVal: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newVal);
      }
      onValueChange?.(newVal);
      setOpen(false);
    },
    [controlledValue, onValueChange],
  );

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        disabled,
        listboxId,
      }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled, listboxId } = useSelect();

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-[14px] border border-border bg-card px-3.5 py-2 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 text-left',
          className,
        )}
        {...props}
      >
        <div className="truncate flex-1">{children}</div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ml-2',
            open && 'rotate-180',
          )}
        />
      </button>
    );
  },
);
SelectTrigger.displayName = 'SelectTrigger';

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SelectValue({ placeholder, className, children }: SelectValueProps) {
  const { value } = useSelect();

  return (
    <span
      className={cn(
        'block truncate',
        !value && !children && 'text-muted-foreground/70',
        className,
      )}
    >
      {children || value || placeholder}
    </span>
  );
}

export interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

export function SelectContent({ className, children }: SelectContentProps) {
  const { open, setOpen, listboxId } = useSelect();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      id={listboxId}
      role="listbox"
      className={cn(
        'absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-[14px] border border-border bg-card p-1 text-foreground shadow-xl animate-in fade-in-80 zoom-in-95',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({
  value,
  children,
  className,
  disabled = false,
}: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelect();
  const isSelected = selectedValue === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        if (!disabled) {
          onValueChange(value);
        }
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-[10px] py-2 pl-3 pr-8 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus:bg-secondary focus:outline-none',
        isSelected && 'bg-primary/10 text-primary font-semibold hover:bg-primary/15',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <span className="truncate flex-1">{children}</span>
      {isSelected && (
        <span className="absolute right-2.5 flex items-center justify-center text-primary">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}


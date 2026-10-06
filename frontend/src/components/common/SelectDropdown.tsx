import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.FC<{ className?: string }>;
  description?: string;
}

interface SelectDropdownProps<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  align?: 'left' | 'right';
  icon?: React.FC<{ className?: string }>;
  size?: 'sm' | 'default';
}

export function SelectDropdown<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  className,
  buttonClassName,
  dropdownClassName,
  align = 'left',
  icon: LeftIcon,
  size = 'default',
}: SelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const SelectedIcon = selectedOption?.icon;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-card text-foreground font-medium transition-all shadow-xs select-none',
          'hover:bg-muted/80 hover:border-border/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          size === 'sm' ? 'px-2.5 py-1 text-xs h-7.5' : 'px-3 py-1.5 text-xs h-8.5',
          isOpen && 'border-primary ring-1 ring-primary/20 bg-muted/50',
          buttonClassName
        )}
      >
        <div className="inline-flex items-center gap-1.5 truncate">
          {LeftIcon && <LeftIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          {SelectedIcon && !LeftIcon && <SelectedIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-foreground'
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] p-1 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl backdrop-blur-md animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            dropdownClassName
          )}
        >
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const ItemIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left select-none',
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {ItemIcon && (
                      <ItemIcon
                        className={cn(
                          'w-3.5 h-3.5 shrink-0',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    )}
                    <div className="truncate">
                      <div>{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

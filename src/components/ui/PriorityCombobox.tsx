import React, { useState, useRef, useEffect } from 'react';
import { TaskPriority } from '../../types';
import { ChevronDown, Check } from 'lucide-react';

interface PriorityOption {
  value: TaskPriority;
  label: string;
  subtext: string;
  badgeBg: string;
  badgeText: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: 'LOW',
    label: 'Low',
    subtext: 'Routine maintenance',
    badgeBg: 'bg-slate-100 border-slate-200',
    badgeText: 'text-slate-700',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    subtext: 'Standard deliverable',
    badgeBg: 'bg-blue-50 border-blue-200/80',
    badgeText: 'text-blue-700',
  },
  {
    value: 'HIGH',
    label: 'High',
    subtext: 'Key business milestone',
    badgeBg: 'bg-amber-50 border-amber-200/80',
    badgeText: 'text-amber-800',
  },
  {
    value: 'URGENT',
    label: 'Urgent',
    subtext: 'Immediate blocker / client SLA',
    badgeBg: 'bg-rose-50 border-rose-200/80',
    badgeText: 'text-rose-700',
  },
];

interface PriorityComboboxProps {
  id?: string;
  value: TaskPriority | '';
  onChange: (value: TaskPriority) => void;
  required?: boolean;
  placeholder?: string;
}

export const PriorityCombobox: React.FC<PriorityComboboxProps> = ({
  id = 'priority-combobox-input',
  value,
  onChange,
  required = false,
  placeholder = 'Select Priority Level...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = PRIORITY_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    if (selectedOption) {
      setQuery(`${selectedOption.label} (${selectedOption.subtext})`);
    } else if (!value) {
      setQuery('');
    }
  }, [value, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (selectedOption) {
          setQuery(`${selectedOption.label} (${selectedOption.subtext})`);
        } else if (!value) {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption, value]);

  const filteredOptions = PRIORITY_OPTIONS.filter((o) => {
    if (!query.trim() || (selectedOption && query === `${selectedOption.label} (${selectedOption.subtext})`)) {
      return true;
    }
    const q = query.toLowerCase().trim();
    return (
      o.label.toLowerCase().includes(q) ||
      o.subtext.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q)
    );
  });

  const handleSelect = (option: PriorityOption) => {
    onChange(option.value);
    setQuery(`${option.label} (${option.subtext})`);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          required={required}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value && e.target.value !== `${selectedOption?.label} (${selectedOption?.subtext})`) {
              onChange('' as TaskPriority);
            }
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white transition-colors"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Popover Options List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-56 overflow-y-auto pr-1">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-slate-400 text-xs font-medium">
              No matching priority levels found.
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${opt.badgeBg} ${opt.badgeText} shrink-0`}>
                        {opt.label}
                      </span>
                      <span className="text-slate-500 truncate">{opt.subtext}</span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

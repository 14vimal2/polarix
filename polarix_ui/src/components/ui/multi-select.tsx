"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "./../../lib/utils";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Checkbox } from "./checkbox";

interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxDisplayed?: number;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
  maxDisplayed = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  const handleRemove = (optionValue: string) => {
    const newValue = value.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    
    const selectedOptions = options.filter(option => value.includes(option.value));
    
    if (selectedOptions.length <= maxDisplayed) {
      return selectedOptions.map(option => option.label).join(", ");
    }
    
    return `${selectedOptions.slice(0, maxDisplayed).map(option => option.label).join(", ")} +${selectedOptions.length - maxDisplayed} more`;
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(option.value)}
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  onChange={() => handleSelect(option.value)}
                />
                <span className="flex-1 text-sm">{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((selectedValue) => {
            const option = options.find(opt => opt.value === selectedValue);
            if (!option) return null;
            
            return (
              <div
                key={selectedValue}
                className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
              >
                <span>{option.label}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-primary/20"
                  onClick={() => handleRemove(selectedValue)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

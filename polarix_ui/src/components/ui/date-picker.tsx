"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { cn } from "./../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

type DatePickerMode = "date" | "month" | "year";

export interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showTime?: boolean;
  timeFormat?: "12h" | "24h";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  showTime = false,
}: DatePickerProps) {
  const [mode, setMode] = React.useState<DatePickerMode>("date");
  const [currentDate, setCurrentDate] = React.useState<Date>(
    value instanceof Date ? value : new Date()
  );

  // Sync currentDate when value prop changes
  React.useEffect(() => {
    if (!value) return;
    if (value instanceof Date) {
      setCurrentDate(value);
      return;
    }
    // value is a string; try to parse ISO or yyyy-MM-dd
    const isoMatch = /\d{4}-\d{2}-\d{2}T/;
    let parsed: Date | null = null;
    if (isoMatch.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) parsed = d;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      // Use 0 as fallback values to ensure they're numbers
      parsed = new Date(y || 0, (m || 1) - 1, d || 1);
    }
    if (parsed) setCurrentDate(parsed);
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      // If we have a current value with time, preserve the time
      if (value && showTime) {
        const source = value instanceof Date ? value : currentDate;
        const newDate = new Date(date);
        newDate.setHours(source.getHours());
        newDate.setMinutes(source.getMinutes());
        onChange?.(newDate);
      } else {
        onChange?.(date);
      }
    }
  };

  const handleTimeChange = (timeString: string) => {
    const base = value instanceof Date ? value : currentDate;
    if (!base) return;
    
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = hoursStr ? parseInt(hoursStr, 10) : 0;
    const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
    
    if (isNaN(hours) || isNaN(minutes)) return;
    
    const newDate = new Date(base);
    newDate.setHours(hours, minutes);
    onChange?.(newDate);
  };

  const getTimeString = () => {
    const src = value instanceof Date ? value : currentDate;
    if (!src) return "00:00";
    return format(src, "HH:mm");
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(currentDate.getFullYear(), month, 1);
    setCurrentDate(newDate);
    setMode("date");
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    setMode("month");
  };

  const navigateYear = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (mode === "year") {
      newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 12 : -12));
    } else {
      newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const renderYearView = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div className="p-3 w-80">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateYear("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {startYear} - {startYear + 11}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateYear("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {years.map((year) => (
            <Button
              key={year}
              variant={year === currentYear ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (
      <div className="p-3 w-80">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateYear("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("year")}
            className="text-sm font-medium hover:bg-accent"
          >
            {currentDate.getFullYear()}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateYear("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {months.map((month, index) => (
            <Button
              key={month}
              variant={index === currentDate.getMonth() ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleMonthSelect(index)}
            >
              {month}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderDateView = () => {
    return (
      <div className="p-3 w-80">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode("month")}
              className="text-sm font-medium hover:bg-accent"
            >
              {format(currentDate, "MMM")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode("year")}
              className="text-sm font-medium hover:bg-accent"
            >
              {currentDate.getFullYear()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={value instanceof Date ? value : currentDate}
          onSelect={handleDateSelect}
          month={currentDate}
          onMonthChange={setCurrentDate}
          initialFocus
          className="w-full"
          classNames={{
            nav: "hidden",
            dropdowns: "hidden",
            month_caption: "hidden",
            caption_label: "hidden",
          }}
        />
        {showTime && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={getTimeString()}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatDisplayValue = (date: Date) => {
    // Display value for the input field the user sees: dd-MM-yyyy or dd-MM-yyyy hh:mm AM/PM
    if (showTime) {
      return format(date, "dd-MM-yyyy h:mm a");
    }
    return format(date, "dd-MM-yyyy");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value
            ? formatDisplayValue(value instanceof Date ? value : currentDate)
            : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === "date" && renderDateView()}
        {mode === "month" && renderMonthView()}
        {mode === "year" && renderYearView()}
      </PopoverContent>
    </Popover>
  );
}
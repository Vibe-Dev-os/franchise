"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
}: {
  value?: Date | string | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const dateValue = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start font-normal", !dateValue && "text-muted-foreground")}
          >
            <CalendarIcon className="size-4" />
            {dateValue ? format(dateValue, "MMM d, yyyy") : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={onChange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

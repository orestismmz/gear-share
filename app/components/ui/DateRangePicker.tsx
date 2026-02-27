"use client";

import { DayPicker, DateRange, Matcher } from "react-day-picker";
// import 'react-day-picker/style.css'

interface DateRangePickerProps {
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  disabled?: Matcher | Matcher[];
}

export default function DateRangePicker({
  selected,
  onSelect,
  disabled,
}: DateRangePickerProps) {
  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      classNames={{
        selected: "rounded-full bg-primary text-white",
      }}
    />
  );
}

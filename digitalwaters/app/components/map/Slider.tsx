"use client"

import React, { useState, useEffect } from 'react';
import { Slider } from "@nextui-org/slider";
import { useSearchParams, useRouter } from "next/navigation";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";

const generateDateRange = (startDate: Date, endDate: Date) => {
  const dates = [];
  let currentDate = startDate;

  while (currentDate >= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return dates;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function DateSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  const startDate = new Date("2024-01-01");
  const sept1Date = new Date("2024-10-20");
  
  const dateRange = generateDateRange(today, sept1Date);
  const [selectedDate, setSelectedDate] = useState<string>(searchParams.get("date") || formatDate(today));
  const [timeValue, setTimeValue] = useState<number>(0); // Set slider to start at 00:00
  
  useEffect(() => {
    const urlDate = searchParams.get("date") || formatDate(today);
    router.push(`?date=${urlDate}`, undefined, { shallow: true });
    setSelectedDate(urlDate);
  }, []);

  // Handle dropdown date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setTimeValue(0); // Reset time slider to 00:00
    router.push(`?date=${date}`, undefined, { shallow: true });
  };

  // Handle time slider change
  const handleTimeChange = (value: number) => {
    setTimeValue(value);
  };

  return (
    <div className="w-full">
      <h3 className="flex justify-center text-slate-300">Select Date and Time:</h3>
      
      <div className="flex justify-center py-4">
        <Dropdown>
          <DropdownTrigger>
            <Button color="primary" variant="shadow" className="capitalize w-20 h-8">
              {selectedDate}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Date Selection"
            color="primary"
            variant="flat"
            selectionMode="single"
            selectedKeys={new Set([selectedDate])}
            onSelectionChange={(keys) => handleDateChange([...keys][0])}
            className="max-h-72 overflow-y-scroll w-48"
            closeOnSelect="true"
            items={dateRange}
            defaultSelectedKeys={new Set([selectedDate])}
            disallowEmptySelection="true"
            autoFocus="top"
          >
            {(item) => (
              <DropdownItem key={formatDate(item)} className="p-2">
                {formatDate(item)}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex justify-center">
        <h4>{`Time: ${timeValue}:00`}</h4>
        <Slider
          min={0}    // Represents 00:00 hours
          max={24}   // Represents 24:00 hours
          step={1}   // 1-hour increments
          value={timeValue}
          onChange={handleTimeChange}
          aria-label="24-Hour Time Slider"
          classNames={{
            base: "gap-3",
            track: "border-s-secondary-100",
            filler: "bg-gradient-to-r from-success-100 to-success-500",
          }}
        />
      </div>
    </div>
  );
}

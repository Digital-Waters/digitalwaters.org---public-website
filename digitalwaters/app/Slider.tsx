"use client";

import React, { useState, useEffect } from 'react';
import { Slider } from "@nextui-org/slider";
import { useSearchParams, useRouter } from "next/navigation";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store.ts";

const generateDateRange = (startDate: Date, endDate: Date) => {
  const dates = [];
  const lastDate = endDate;

  while (lastDate <= startDate) {
    dates.push(new Date(lastDate));
    lastDate.setDate(lastDate.getDate() + 1);
  }

  return dates;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const formatTime = (value: number) => {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export default function DateSlider() {

  const dateLimit = useSelector((state: RootState) => state.waterData.dateLimit);
  console.log(typeof dateLimit[0]);
  const leftBig = "<<";
  const leftSmall = "<";
  const rightBig = ">>";
  const rightSmall = ">";


  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  const startDate = new Date("2024-10-20");
  
  const dateRange = generateDateRange(today, startDate);
  const [selectedDate, setSelectedDate] = useState<string>(searchParams.get("date") || formatDate(today));
  const [timeValue, setTimeValue] = useState<number>(0); // Slider starts at 00:00
  
  const step = 1/6; 

  useEffect(() => {
    const urlDate = searchParams.get("date") || formatDate(today);
    const urlTime = searchParams.get("time") || "00:00";
    router.push(`?date=${urlDate}&time=${urlTime}`, undefined, { shallow: true });
    setSelectedDate(urlDate);
    setTimeValue(parseFloat(urlTime.replace(':', '.')));
  }, []);

  // Handle dropdown date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    router.push(`?date=${date}&time=00:00`, undefined, { shallow: true });
  };

  // Handle time slider change
  const handleTimeChange = (value: number) => {
    setTimeValue(value);
    const timeString = formatTime(value);
    router.push(`?date=${selectedDate}&time=${timeString}`, undefined, { shallow: true });
  };

  return (
    <div className="w-full">
      <h3 className="flex justify-center text-slate-300">Select Date and Time:</h3>
      
      <div className="flex justify-center py-2">
        <Button color="primary" variant="faded" className="capitalize w-8 h-8 font-bold mx-2"> {leftBig} </Button>
        <Button color="primary" variant="faded" className="capitalize w-8 h-8 font-bold mx-2"> {leftSmall} </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button color="primary" variant="faded" className="capitalize w-24 h-8 font-bold mx-2">
              {selectedDate}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Date Selection"
            color="warning"
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
        
        <Button color="primary" variant="faded" className="capitalize w-8 h-8 font-bold mx-2"> {rightSmall} </Button>
        <Button color="primary" variant="faded" className="capitalize w-8 h-8 font-bold mx-2"> {rightBig} </Button>
      </div>

      <div className="flex justify-center">
        <Slider
          min={0}    // Represents 00:00 hours
          maxValue={24}   // Represents 24:00 hours
          step={step}   // 5-minute increments
          value={timeValue}
          onChange={handleTimeChange}
          aria-label="24-Hour Time Slider"
          label="Time" 
          color="primary"
        />
      </div>
    </div>
  );
}

"use client"

import React, { useState, useEffect } from 'react';
import { Slider } from "@nextui-org/slider";
import Link from "next/link";
import {useSearchParams, useRouter} from "next/navigation";


const daysBetween = (startDate: Date, endDate: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay);
};

const addDays = (date: Date, value: number, days: number) => {
  const result = new Date(date.getTime()); // Use getTime() to avoid mutation of original date
  result.setDate(result.getDate() + (days*(value/100)));
  return result;
};

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Component
export default function DateSlider() {
  const router = useRouter(); // Use the router to manipulate URL
  const searchParams = useSearchParams();
  const today = new Date();
  const startDate = new Date('2024-01-01'); // Start date: January 1, 2024

  // Total days between start and today
  const totalDays = daysBetween(startDate, today);
  const step = 100/totalDays;

  const [sliderValue, setSliderValue] = useState<int>(totalDays);
  const [selectedDate, setSelectedDate] = useState<Date>(searchParams.get("date") || formatDate(today));

  useEffect(() => {
    const currentUrlDate = searchParams.get("date");
    const formattedDate = formatDate(today);

    // If no date is in the URL, set the current date as default
    if (!currentUrlDate) {
      router.push(`?date=${formattedDate}`, undefined, { shallow: true });
    } else {
      // If there is a date in the URL, set that as the selected date
      setSelectedDate(currentUrlDate);
      const daysPassed = daysBetween(startDate, new Date(currentUrlDate));
      setSliderValue(daysPassed); // Set the slider to the position of the selected date
    }
  }, []);

  // Handle slider change
  const handleChange = (value: number) => {
    setSliderValue(value);
    const newDate = addDays(startDate, value, totalDays);
    const formattedDate = formatDate(newDate);
    setSelectedDate(formattedDate); // Update selected date

    router.push(`?date=${formattedDate}`, undefined, { shallow: true });
  };

  
  return (
    <div className="w-full">
      <h3 className="flex justify-center text-slate-300">Select a Date:</h3>
      
      <div className="flex justify-center text-slate-300">Showing data up to: {selectedDate}</div>
      
      
        <Slider
          min={0} // Starting from the first day of the range
          max={totalDays} // Max value is today's date
          step={step} // Day-by-day increment
          size="md"
          defaultValue={sliderValue}
          onChangeEnd={handleChange} // Update selected date when slider changes
          aria-label="Date Slider"
          classNames={{
            base: " gap-3",
            track: "border-s-secondary-100",
            filler: "bg-gradient-to-r from-success-100 to-success-500"
          }}
          
        />
    </div>
  );
}

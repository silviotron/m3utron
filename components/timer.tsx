"use client";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

interface TimerProps {
  start: string;
  className?: string;
}

export default function Timer({ start, className }: TimerProps) {
  const [currentTime, setCurrentTime] = useState(() => dayjs());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!isClient) {
    return null; // O renderiza un fallback si es necesario
  }

  const hours = currentTime.diff(dayjs(start), "hours");
  const minutes = String(currentTime.diff(dayjs(start), "minutes") % 60).padStart(2, "0");
  const seconds = String(currentTime.diff(dayjs(start), "seconds") % 60).padStart(2, "0");

  return (
    <span
      style={{ fontFamily: "Helvetica Neue, sans-serif" }}
      className={`text-sm ${className}`}
    >
      {hours}:{minutes}:{seconds}
    </span>
  );
}

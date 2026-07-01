"use client";
import React, { useEffect, useState } from "react";

type LoadingScreenProps = {
  open: boolean;
};

export default function LoadingScreen({ open }: LoadingScreenProps) {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat(dotCount);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col gap-4 items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-white border-t-transparent" style={{ animationDuration: '0.5s' }}></div>
        <div className="absolute inset-3 rounded-full bg-white/10 blur-xl"></div>
      </div>
      <h1 className="text-lg text-white">please wait{dots}</h1>
    </div>
  );
}

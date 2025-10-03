// src/components/Spinner.jsx
import React from "react";
import "../../styles/spinner.css"

export default function Spinner({ size = 12 }) {
  const dimension = `${size}rem`;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <svg
        style={{ height: dimension, width: dimension }}
        className="animate-spin-slow bounce-fade"
        viewBox="0 0 50 50"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="90 150"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

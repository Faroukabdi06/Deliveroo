// src/components/Spinner.jsx
import React from "react";

export default function Spinner({ size = 24 }) {
  const spinnerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const svgStyle = {
    animation: "spin 1s linear infinite",
    height: `${size}px`,
    width: `${size}px`,
  };

  return (
    <div role="status" aria-live="polite" style={spinnerStyle}>
      <svg
        style={svgStyle}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          style={{ opacity: 0.25 }}
        />
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          style={{ opacity: 0.75 }}
        />
      </svg>
      <span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}>
        Loading
      </span>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

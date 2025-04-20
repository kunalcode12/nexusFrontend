import React, { forwardRef } from "react";

// eslint-disable-next-line react/display-name
export const Textarea = forwardRef(({ className = "", ...props }, ref) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

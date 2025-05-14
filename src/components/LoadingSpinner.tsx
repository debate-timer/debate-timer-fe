import React from 'react';

interface LoadingSpinnerProps {
  /**
   * Tailwind CSS class string for controlling the size (e.g., 'h-6 w-6').
   * Defaults to 'h-6 w-6'.
   */
  size?: string;
  /**
   * Tailwind CSS class string for controlling the color (e.g., 'text-blue-500').
   * Defaults to 'text-blue-500'.
   */
  color?: string;
  /**
   * Stroke width of the spinner circle.
   * Defaults to 4.
   */
  strokeWidth?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'h-6 w-6',
  color = 'text-blue-500',
  strokeWidth = 4, // Add default strokeWidth
}) => {
  // Calculate circumference for stroke-dasharray
  const radius = 10; // Based on r="10" in the circle element
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      className={`animate-spin ${size} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status" // Accessibility role
      aria-label="Loading" // Accessibility label
    >
      {/* Use a single circle */}
      <circle
        cx="12"
        cy="12"
        r={radius} // Use the radius variable
        stroke="currentColor"
        strokeWidth={strokeWidth} // Use the strokeWidth prop
        // These properties create the partial circle effect and make it spin
        strokeDasharray={circumference * 0.75 + ' ' + circumference * 0.25} // Example: 75% arc, 25% gap
        strokeDashoffset="0" // Starting offset
        strokeLinecap="round" // Optional: gives rounded ends to the arc
        className="origin-center" // Ensure the circle rotates from its center (important for stroke-dashoffset animation)
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }} // Ensure rotation works correctly
      >
        {/* The animate-spin class on the parent SVG handles the rotation */}
      </circle>
    </svg>
  );
};

export default LoadingSpinner;

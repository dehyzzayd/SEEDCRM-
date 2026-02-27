"use client";

interface LogoProps {
  variant?: "full" | "icon";
  color?: string;
  height?: number;
  className?: string;
}

export function DealerseedLogo({
  variant = "full",
  color = "currentColor",
  height = 32,
  className = "",
}: LogoProps) {
  if (variant === "icon") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        height={height}
        width={height}
        fill={color}
        className={className}
        aria-label="Dealerseed"
      >
        {/* Steering wheel icon */}
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="3"  fill={color} />
        <line x1="12" y1="2"  x2="12" y2="9"  stroke={color} strokeWidth="2" />
        <line x1="12" y1="15" x2="12" y2="22" stroke={color} strokeWidth="2" />
        <line x1="2"  y1="12" x2="9"  x2="12" stroke={color} strokeWidth="2" />
        <line x1="15" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  const scale = height / 40;
  const width = Math.round(185 * scale);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 185 40"
      height={height}
      width={width}
      fill={color}
      className={className}
      aria-label="Dealerseed"
    >
      {/* Steering wheel mark */}
      <circle cx="20" cy="20" r="16" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="20" cy="20" r="4.5" fill={color} />
      <line x1="20" y1="4"  x2="20" y2="15.5" stroke={color} strokeWidth="3" />
      <line x1="20" y1="24.5" x2="20" y2="36" stroke={color} strokeWidth="3" />
      <line x1="4"  y1="20" x2="15.5" y2="20" stroke={color} strokeWidth="3" />
      <line x1="24.5" y1="20" x2="36" y2="20" stroke={color} strokeWidth="3" />

      {/* Wordmark */}
      <text
        x="44"
        y="28"
        fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif"
        fontSize="24"
        fontWeight="600"
        letterSpacing="-0.5"
        fill={color}
      >
        Dealerseed
      </text>
    </svg>
  );
}

interface Props {
  variant?: "full" | "icon";
  height?: number;
  className?: string;
}

export function DealerseedLogo({ variant = "full", height = 32, className = "" }: Props) {
  if (variant === "icon") {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        className={className}
        aria-label="Dealerseed"
      >
        <rect width="40" height="40" rx="10" fill="#10B981" />
        <path d="M20 32 L20 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 22 C20 22 14 20 13 14 C13 14 19 13 22 18" fill="white" opacity="0.9" />
        <path d="M20 26 C20 26 26 24 27 18 C27 18 21 17 18 22" fill="white" opacity="0.65" />
      </svg>
    );
  }

  const iconSize = height;
  const totalWidth = height * 5.2;

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      fill="none"
      className={className}
      aria-label="Dealerseed"
    >
      {/* Green icon box */}
      <rect width={iconSize} height={iconSize} rx={iconSize * 0.25} fill="#10B981" />
      {/* Stem */}
      <line
        x1={iconSize * 0.5}
        y1={iconSize * 0.8}
        x2={iconSize * 0.5}
        y2={iconSize * 0.42}
        stroke="white"
        strokeWidth={iconSize * 0.065}
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path
        d={`M${iconSize*0.5} ${iconSize*0.55} C${iconSize*0.5} ${iconSize*0.55} ${iconSize*0.3} ${iconSize*0.49} ${iconSize*0.28} ${iconSize*0.33} C${iconSize*0.28} ${iconSize*0.33} ${iconSize*0.48} ${iconSize*0.3} ${iconSize*0.54} ${iconSize*0.46}`}
        fill="white"
        opacity="0.95"
      />
      {/* Right leaf */}
      <path
        d={`M${iconSize*0.5} ${iconSize*0.65} C${iconSize*0.5} ${iconSize*0.65} ${iconSize*0.7} ${iconSize*0.59} ${iconSize*0.72} ${iconSize*0.43} C${iconSize*0.72} ${iconSize*0.43} ${iconSize*0.52} ${iconSize*0.4} ${iconSize*0.46} ${iconSize*0.56}`}
        fill="white"
        opacity="0.65"
      />
      {/* "dealer" in green */}
      <text
        x={iconSize * 1.25}
        y={iconSize * 0.73}
        fontFamily="Inter, DM Sans, system-ui, sans-serif"
        fontSize={iconSize * 0.6}
        fontWeight="700"
        letterSpacing="-0.5"
        fill="#10B981"
      >
        Dealer
      </text>
      {/* "seed" inherits text color (white in dark, dark in light) */}
      <text
        x={iconSize * 1.25 + iconSize * 0.6 * 2.88}
        y={iconSize * 0.73}
        fontFamily="Inter, DM Sans, system-ui, sans-serif"
        fontSize={iconSize * 0.6}
        fontWeight="700"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        seed
      </text>
    </svg>
  );
}
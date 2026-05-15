import React from "react";

export interface OrbitalIconProps {
  size?: string | number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * OrbitalIcon — the Orbital Wallet logo as an inline SVG.
 * Drop-in replacement for YoursIcon from yours-wallet-provider.
 *
 * @example
 * <OrbitalIcon size="32px" color="#00d4ff" />
 */
export const OrbitalIcon: React.FC<OrbitalIconProps> = ({
  size = "24px",
  color = "currentColor",
  className,
  style,
}) => {
  const px = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Orbital Wallet"
      role="img"
    >
      {/* Outer orbit ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={color}
        strokeWidth="4"
        opacity="0.4"
      />
      {/* Inner orbit ring */}
      <circle
        cx="50"
        cy="50"
        r="30"
        stroke={color}
        strokeWidth="3"
        opacity="0.6"
      />
      {/* Centre nucleus */}
      <circle cx="50" cy="50" r="12" fill={color} />
      {/* Orbiting dot — top */}
      <circle cx="50" cy="6" r="5" fill={color} />
      {/* Orbiting dot — right */}
      <circle cx="94" cy="50" r="5" fill={color} opacity="0.7" />
      {/* Orbiting dot — bottom-left */}
      <circle cx="18" cy="82" r="5" fill={color} opacity="0.5" />
      {/* Cross-hair lines (subtle) */}
      <line
        x1="50"
        y1="20"
        x2="50"
        y2="80"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.2"
      />
      <line
        x1="20"
        y1="50"
        x2="80"
        y2="50"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.2"
      />
    </svg>
  );
};

export default OrbitalIcon;

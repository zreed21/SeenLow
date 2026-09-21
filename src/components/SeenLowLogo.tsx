"use client";

import React from "react";

interface LogoProps {
  variant?: "icon" | "wordmark" | "lockup";
  size?: "sm" | "md" | "lg";
  className?: string;
  theme?: "dark" | "light" | "auto";
}

/**
 * Official SeenLow Brand Vector Logo Component
 * - Colors: Black #0A0A0A · Crimson Red #B91C1C
 * - Variants:
 *    - "icon": App icon squircle with intertwined red SL monogram
 *    - "wordmark": "Seen" (theme text) + "Low" (Red #B91C1C with eye-pupil dot in 'o')
 *    - "lockup": Icon + Wordmark combined
 */
export function SeenLowLogo({
  variant = "lockup",
  size = "md",
  className = "",
  theme = "auto",
}: LogoProps) {
  // Dimension presets
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const lockupHeights = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
  };

  if (variant === "icon") {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-[#0A0A0A] border border-neutral-800 shadow-md overflow-hidden ${iconSizes[size]} ${className}`}
        title="SeenLow"
      >
        <svg
          viewBox="0 0 512 512"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#B91C1C">
            {/* Top S loop */}
            <path d="M 230 144 C 176 144 146 178 146 226 L 188 226 C 188 198 206 182 230 182 L 288 182 C 304 182 316 194 316 208 C 316 222 304 234 288 234 L 146 234 L 146 272 L 288 272 C 334 272 358 244 358 208 C 358 170 330 144 286 144 Z" />
            {/* Lower L stem + foot with speech-pointer beak */}
            <path d="M 230 234 L 230 326 L 332 326 L 332 296 L 366 358 L 188 358 L 188 234 Z" />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <span
        className={`inline-flex items-center font-extrabold tracking-tight select-none ${
          size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"
        } ${className}`}
      >
        <span className="text-white dark:text-white light:text-[#0A0A0A] transition-colors">
          Seen
        </span>
        <span className="text-[#B91C1C] flex items-center">
          <span>L</span>
          <span className="relative inline-flex items-center justify-center mx-[1px]">
            <span>o</span>
            {/* Eye pupil dot in center of 'o' */}
            <span
              className="absolute w-[3px] h-[3px] rounded-full bg-[#B91C1C] pointer-events-none"
              style={{ top: "54%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
          </span>
          <span>w</span>
        </span>
      </span>
    );
  }

  // Lockup variant: Icon + Wordmark
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${lockupHeights[size]} ${className}`}>
      {/* Icon squircle */}
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 shadow-md shadow-red-950/20 overflow-hidden ${iconSizes[size]}`}
      >
        <svg
          viewBox="0 0 512 512"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#B91C1C">
            <path d="M 230 144 C 176 144 146 178 146 226 L 188 226 C 188 198 206 182 230 182 L 288 182 C 304 182 316 194 316 208 C 316 222 304 234 288 234 L 146 234 L 146 272 L 288 272 C 334 272 358 244 358 208 C 358 170 330 144 286 144 Z" />
            <path d="M 230 234 L 230 326 L 332 326 L 332 296 L 366 358 L 188 358 L 188 234 Z" />
          </g>
        </svg>
      </div>

      {/* Wordmark with custom stylized "o" containing the eye-pupil */}
      <span
        className={`font-black tracking-tight leading-none ${
          size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl"
        }`}
      >
        <span className="text-white dark:text-white">Seen</span>
        <span className="text-[#B91C1C] inline-flex items-center">
          <span>L</span>
          <span className="relative inline-flex items-center justify-center mx-[1px]">
            <span>o</span>
            <span
              className="absolute w-[3px] h-[3px] rounded-full bg-[#B91C1C] pointer-events-none"
              style={{ top: "54%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
          </span>
          <span>w</span>
        </span>
      </span>
    </div>
  );
}

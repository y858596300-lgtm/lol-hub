"use client";

import { useState } from "react";

interface StarRatingProps {
  championId: string;
  skinNum: number;
  initialRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

function getStorageKey(championId: string, skinNum: number): string {
  return `${championId}_${skinNum}`;
}

function getRating(championId: string, skinNum: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("ratings");
    if (!raw) return 0;
    const ratings = JSON.parse(raw);
    return ratings[getStorageKey(championId, skinNum)] || 0;
  } catch {
    return 0;
  }
}

function saveRating(championId: string, skinNum: number, rating: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("ratings");
    const ratings = raw ? JSON.parse(raw) : {};
    ratings[getStorageKey(championId, skinNum)] = rating;
    localStorage.setItem("ratings", JSON.stringify(ratings));
  } catch {
    // ignore
  }
}

export default function StarRating({
  championId,
  skinNum,
  initialRating,
  onRate,
  readonly = false,
}: StarRatingProps) {
  const [rating, setRating] = useState(
    initialRating ?? getRating(championId, skinNum)
  );
  const [hover, setHover] = useState(0);

  const handleClick = (value: number) => {
    if (readonly) return;
    // Toggle off if clicking the same star again
    const newRating = rating === value ? 0 : value;
    setRating(newRating);
    saveRating(championId, skinNum, newRating);
    onRate?.(newRating);
  };

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hover || rating) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            className={`text-lg transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            {filled ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-slate-600">☆</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

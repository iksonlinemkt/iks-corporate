export default function Whale({ size = 64, withHeart = true }: { size?: number; withHeart?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {withHeart && (
        <path
          d="M70 18c-3-4-9-4-11 0-2-4-8-4-11 0-3 5 2 10 11 16 9-6 14-11 11-16z"
          fill="#E8553A"
        />
      )}
      <ellipse cx="50" cy="58" rx="34" ry="28" fill="#3E7BFA" />
      <ellipse cx="50" cy="58" rx="34" ry="28" fill="url(#whaleGrad)" />
      <circle cx="40" cy="50" r="3" fill="#0B2D6B" />
      <path d="M28 64c4 3 9 4 14 1" stroke="#0B2D6B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="62" r="4" fill="#FFB4A8" opacity="0.7" />
      <circle cx="50" cy="58" r="9" fill="#CFE0FF" stroke="#9DBBF5" strokeWidth="1" />
      <path d="M50 53a5 5 0 0 1 5 5" stroke="#9DBBF5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M16 70c-6 2-10 7-9 12 5 1 10-2 13-7" fill="#3E7BFA" />
      <path d="M84 70c6 2 10 7 9 12-5 1-10-2-13-7" fill="#3E7BFA" />
      <defs>
        <linearGradient id="whaleGrad" x1="16" y1="30" x2="84" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5C93FF" />
          <stop offset="1" stopColor="#2E63D6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

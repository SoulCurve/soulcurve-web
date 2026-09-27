function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="brand-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#4a7cf0" />
          <stop offset="1" stopColor="#5cc8dc" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#12151c" stroke="#2f3647" />
      <path
        d="M6 22 C 11 22, 12 12, 16 14 S 22 8, 26 9"
        fill="none"
        stroke="url(#brand-gradient)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="26" cy="9" r="2.4" fill="#5cc8dc" />
    </svg>
  );
}

export default BrandMark;

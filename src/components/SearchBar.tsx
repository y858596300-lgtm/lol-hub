"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "搜索英雄名称...",
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-sm group">
      {/* Crystal search icon */}
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9CBA]
                   group-focus-within:text-[#0AB4FF] transition-colors duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5
                   bg-[#040B1A]/60 backdrop-blur-md
                   border border-[#8E9CBA]/20
                   rounded-lg
                   text-sm text-white placeholder-[#8E9CBA]/40
                   focus:outline-none focus:border-[#0AB4FF]/40 focus:ring-1 focus:ring-[#0AB4FF]/15
                   transition-all duration-300"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     w-5 h-5 flex items-center justify-center
                     text-[#8E9CBA]/60 hover:text-[#8E9CBA]
                     rounded-full hover:bg-[#8E9CBA]/10
                     transition-all duration-200"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Focus glow */}
      <div className="absolute inset-0 rounded-lg bg-[#0AB4FF]/0 blur-md
                    group-focus-within:bg-[#0AB4FF]/5 transition-all duration-300 -z-10" />
    </div>
  );
}

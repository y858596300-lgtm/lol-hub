"use client";

import Image from "next/image";

interface HeroCardProps {
  id: string;
  name: string;
  title: string;
}

export default function HeroCard({ id, name, title }: HeroCardProps) {
  return (
    <div
      className="group relative cursor-pointer"
    >
      {/* Card body */}
      <div
        className="glass-card overflow-hidden transition-all duration-300
                   group-hover:border-cyan-400/40 group-hover:shadow-lg group-hover:shadow-cyan-400/5
                   group-hover:-translate-y-1"
      >
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040B1A] via-[#040B1A]/20 to-transparent" />

          {/* Hex corner accent — top-left */}
          <div
            className="absolute top-2 left-2 w-4 h-4 opacity-0 group-hover:opacity-100
                       transition-opacity duration-300"
          >
            <div className="w-full h-full border-l border-t border-[#0AB4FF]/50" />
          </div>
          {/* Hex corner accent — top-right */}
          <div
            className="absolute top-2 right-2 w-4 h-4 opacity-0 group-hover:opacity-100
                       transition-opacity duration-300"
          >
            <div className="w-full h-full border-r border-t border-[#0AB4FF]/50" />
          </div>
        </div>

        {/* Info */}
        <div className="p-3 relative">
          {/* Crystal dot indicator */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2
                        bg-[#0AB4FF] rotate-45 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 shadow-sm shadow-[#0AB4FF]/50" />

          <h3 className="text-sm font-semibold text-white group-hover:text-[#0AB4FF]
                       transition-colors duration-200 truncate text-center">
            {name}
          </h3>
          <p className="text-xs text-[#8E9CBA] mt-0.5 truncate text-center font-light">
            {title}
          </p>
        </div>
      </div>

      {/* Hover glow ring */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-b from-[#0AB4FF]/0 to-[#0AB4FF]/0
                    group-hover:from-[#0AB4FF]/10 group-hover:to-[#7C3AED]/5
                    transition-all duration-300 -z-10 blur-sm" />
    </div>
  );
}

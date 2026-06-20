"use client";

import { useState } from "react";

const WIDTH = 980;
const HEIGHT = 110;

function generateHillPath(
  baseY: number,
  amplitude: number,
  seed: number,
  bottom: number
) {
  const points: string[] = [];
  const segments = 16;
  const wave1 = 1 + seed * 0.4;
  const wave2 = 2.3 + seed * 0.7;
  const wave3 = 4.1 + seed * 1.1;
  const phase1 = seed * 6.28;
  const phase2 = seed * 3.14;
  const phase3 = seed * 9.42;

  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * WIDTH;
    const t = i / segments;
    const y =
      baseY +
      Math.sin(t * Math.PI * wave1 + phase1) * amplitude +
      Math.sin(t * Math.PI * wave2 + phase2) * (amplitude * 0.4) +
      Math.sin(t * Math.PI * wave3 + phase3) * (amplitude * 0.2);
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return `M0 ${bottom} L${points.join(" L")} L${WIDTH} ${bottom} Z`;
}

function generateStars(count: number, seed: number) {
  const stars = [];
  let rand = seed;
  const next = () => {
    rand = (rand * 9301 + 49297) % 233280;
    return rand / 233280;
  };

  for (let i = 0; i < count; i++) {
    stars.push({
      cx: next() * WIDTH,
      cy: next() * 45,
      r: 0.8 + next() * 0.7,
      opacity: 0.35 + next() * 0.4,
    });
  }
  return stars;
}

export function DesertStrip() {
  const [scene] = useState(() => {
    const seed = Math.random();
    const farHillPath = generateHillPath(64, 10 + seed * 6, seed, HEIGHT);
    const nearHillPath = generateHillPath(
      80,
      8 + seed * 5,
      seed + 0.5,
      HEIGHT
    );
    const stars = generateStars(10, Math.floor(seed * 100000) || 1);
    const moonX = 760 + seed * 140;

    return { farHillPath, nearHillPath, stars, moonX };
  });

  return (
    <div className="relative my-5 h-[90px] w-full overflow-hidden rounded-lg bg-[#14181a] sm:h-[110px]">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block"
      >
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#14181a" />

        {/* Stars — the only background layer that drifts, with regen loop */}
        <g className="animate-drift-slow">
          {scene.stars.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#f5f0e8"
              opacity={s.opacity}
            />
          ))}
        </g>
        <g className="animate-drift-slow" transform={`translate(${WIDTH},0)`}>
          {scene.stars.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#f5f0e8"
              opacity={s.opacity}
            />
          ))}
        </g>

        {/* Moon — fixed */}
        <circle cx={scene.moonX} cy="28" r="22" fill="#f5f0e8" opacity="0.85" />
        <circle cx={scene.moonX + 8} cy="22" r="18" fill="#14181a" />

        {/* Hills — fixed, generated fresh per page load but no scroll */}
        <path d={scene.farHillPath} fill="#23291f" />
        <path d={scene.nearHillPath} fill="#1b201a" />

        {/* Road — fixed */}
        <path
          d="M0 86 L980 86"
          stroke="#f5f0e8"
          strokeWidth="1"
          strokeDasharray="14 10"
          opacity="0.25"
        />

        {/* Van — fixed body, spinning wheels */}
        <g transform="translate(440,-9)">
          <ellipse cx="50" cy="94" rx="58" ry="3" fill="#000" opacity="0.35" />
          <path
            d="M0 87 L8 67 Q12 61 22 61 L70 61 Q80 61 84 69 L92 87 Z"
            fill="#4a7c59"
          />
          <rect
            x="22"
            y="67"
            width="40"
            height="14"
            rx="2"
            fill="#0d0f0d"
            opacity="0.6"
          />
          <circle cx="78" cy="73" r="3" fill="#f5f0e8" opacity="0.9" />

          <g className="animate-spin-wheel" style={{ transformOrigin: "20px 87px" }}>
            <circle
              cx="20"
              cy="87"
              r="8"
              fill="#0d0f0d"
              stroke="#f5f0e8"
              strokeWidth="1.5"
            />
            <line x1="20" y1="79" x2="20" y2="95" stroke="#f5f0e8" strokeWidth="1" opacity="0.6" />
            <line x1="12" y1="87" x2="28" y2="87" stroke="#f5f0e8" strokeWidth="1" opacity="0.6" />
          </g>

          <g className="animate-spin-wheel" style={{ transformOrigin: "72px 87px" }}>
            <circle
              cx="72"
              cy="87"
              r="8"
              fill="#0d0f0d"
              stroke="#f5f0e8"
              strokeWidth="1.5"
            />
            <line x1="72" y1="79" x2="72" y2="95" stroke="#f5f0e8" strokeWidth="1" opacity="0.6" />
            <line x1="64" y1="87" x2="80" y2="87" stroke="#f5f0e8" strokeWidth="1" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
}
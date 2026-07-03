"use client";

import { motion } from "framer-motion";

const BOKEH = [
  { top: "12%", left: "8%", size: 4, delay: 0, drift: { x: [0, 18, -8, 0], y: [0, -22, 12, 0] } },
  { top: "25%", left: "85%", size: 3, delay: 1.2, drift: { x: [0, -24, 10, 0], y: [0, 16, -14, 0] } },
  { top: "70%", left: "15%", size: 5, delay: 0.6, drift: { x: [0, 14, -20, 0], y: [0, -18, 8, 0] } },
  { top: "80%", left: "75%", size: 3, delay: 1.8, drift: { x: [0, -16, 22, 0], y: [0, 12, -20, 0] } },
  { top: "45%", left: "92%", size: 4, delay: 0.3, drift: { x: [0, -28, 6, 0], y: [0, 20, -10, 0] } },
  { top: "55%", left: "5%", size: 3, delay: 2.1, drift: { x: [0, 20, -12, 0], y: [0, -16, 24, 0] } },
  { top: "18%", left: "55%", size: 2, delay: 1.5, drift: { x: [0, 12, -18, 0], y: [0, 28, -8, 0] } },
  { top: "88%", left: "45%", size: 4, delay: 0.9, drift: { x: [0, -10, 16, 0], y: [0, -24, 14, 0] } },
  { top: "35%", left: "30%", size: 2, delay: 2.5, drift: { x: [0, 22, -14, 0], y: [0, -12, 18, 0] } },
  { top: "62%", left: "60%", size: 3, delay: 1.1, drift: { x: [0, -18, 8, 0], y: [0, 14, -22, 0] } },
  { top: "8%", left: "72%", size: 2, delay: 3, drift: { x: [0, 16, -20, 0], y: [0, 20, -16, 0] } },
  { top: "92%", left: "22%", size: 3, delay: 0.4, drift: { x: [0, -22, 12, 0], y: [0, -10, 20, 0] } },
];

const WAVE_PATHS = [
  {
    d: [
      "M0,400 C240,320 480,480 720,400 C960,320 1200,480 1440,400 L1440,600 L0,600 Z",
      "M0,420 C240,500 480,340 720,420 C960,500 1200,340 1440,420 L1440,600 L0,600 Z",
      "M0,400 C240,320 480,480 720,400 C960,320 1200,480 1440,400 L1440,600 L0,600 Z",
    ],
    strokeWidth: 2,
    opacity: 1,
    duration: 5,
    delay: 0,
  },
  {
    d: [
      "M0,450 C360,380 480,520 720,450 C960,380 1080,520 1440,450",
      "M0,430 C360,500 480,360 720,430 C960,500 1080,360 1440,430",
      "M0,450 C360,380 480,520 720,450 C960,380 1080,520 1440,450",
    ],
    strokeWidth: 1.5,
    opacity: 0.6,
    duration: 4,
    delay: 0.8,
  },
  {
    d: [
      "M0,480 C200,420 600,540 900,480 C1100,440 1300,520 1440,490",
      "M0,460 C200,520 600,400 900,460 C1100,500 1300,420 1440,470",
      "M0,480 C200,420 600,540 900,480 C1100,440 1300,520 1440,490",
    ],
    strokeWidth: 1,
    opacity: 0.35,
    duration: 6,
    delay: 1.6,
  },
  {
    d: [
      "M0,510 C300,460 500,560 800,510 C1000,470 1200,550 1440,520",
      "M0,490 C300,540 500,440 800,490 C1000,530 1200,450 1440,500",
      "M0,510 C300,460 500,560 800,510 C1000,470 1200,550 1440,520",
    ],
    strokeWidth: 1,
    opacity: 0.25,
    duration: 7,
    delay: 2.2,
  },
];

function WireframeSphere({ className, duration, reverse }: { className?: string; duration: number; reverse?: boolean }) {
  return (
    <motion.div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${className ?? ""}`}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="200" cy="200" r="160" fill="none" stroke="#00f2ff" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#00c9a7" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="80" fill="none" stroke="#00f2ff" strokeWidth="0.5" />
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <ellipse
            key={deg}
            cx="200"
            cy="200"
            rx="160"
            ry="40"
            fill="none"
            stroke="#00c9a7"
            strokeWidth="0.4"
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
        {[0, 45, 90, 135].map((deg) => (
          <ellipse
            key={`v-${deg}`}
            cx="200"
            cy="200"
            rx="40"
            ry="160"
            fill="none"
            stroke="#00f2ff"
            strokeWidth="0.4"
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
      </svg>
    </motion.div>
  );
}

export function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#030508]" />

      {/* Drifting ambient gradients */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 201, 167, 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0, 242, 255, 0.06) 0%, transparent 60%)",
            "radial-gradient(ellipse 70% 55% at 55% 45%, rgba(0, 242, 255, 0.07) 0%, transparent 70%), radial-gradient(ellipse 55% 45% at 25% 75%, rgba(0, 201, 167, 0.07) 0%, transparent 60%)",
            "radial-gradient(ellipse 75% 65% at 45% 55%, rgba(0, 201, 167, 0.09) 0%, transparent 70%), radial-gradient(ellipse 65% 35% at 75% 70%, rgba(0, 242, 255, 0.05) 0%, transparent 60%)",
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 201, 167, 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0, 242, 255, 0.06) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating bokeh */}
      {BOKEH.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#00f2ff]"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            boxShadow: `0 0 ${dot.size * 4}px rgba(0, 242, 255, 0.7)`,
          }}
          animate={{
            opacity: [0.2, 0.9, 0.4, 0.8, 0.2],
            scale: [1, 1.4, 0.9, 1.2, 1],
            x: dot.drift.x,
            y: dot.drift.y,
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Rising particle streams */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`stream-${i}`}
          className="absolute w-px h-16 bg-linear-to-t from-transparent via-[#00f2ff]/40 to-transparent"
          style={{
            left: `${15 + i * 14}%`,
            bottom: "10%",
          }}
          animate={{
            y: [0, -120, -240],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4 + i * 0.6,
            repeat: Infinity,
            delay: i * 0.9,
            ease: "linear",
          }}
        />
      ))}

      {/* Wireframe spheres — counter-rotate */}
      <WireframeSphere
        className="w-[min(700px,90vw)] h-[min(700px,90vw)] opacity-[0.12]"
        duration={45}
      />
      <WireframeSphere
        className="w-[min(520px,70vw)] h-[min(520px,70vw)] opacity-[0.08]"
        duration={32}
        reverse
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(380px,55vw)] h-[min(380px,55vw)] opacity-[0.06] rounded-full border border-[#00f2ff]/30"
        animate={{ scale: [1, 1.08, 1], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Flowing wave lines */}
      <motion.svg
        className="absolute bottom-0 left-0 w-[120%] h-[55%] opacity-45"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ x: ["0%", "-8%", "0%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c9a7" stopOpacity="0" />
            <stop offset="30%" stopColor="#00c9a7" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#00f2ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {WAVE_PATHS.map((wave, i) => (
          <motion.path
            key={i}
            d={wave.d[0]}
            fill="none"
            stroke={i === 2 || i === 3 ? "#00f2ff" : "url(#waveGrad1)"}
            strokeWidth={wave.strokeWidth}
            filter="url(#glow)"
            opacity={wave.opacity}
            animate={{ d: wave.d }}
            transition={{
              duration: wave.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: wave.delay,
            }}
          />
        ))}
      </motion.svg>

      {/* Secondary wave layer — opposite drift */}
      <motion.svg
        className="absolute bottom-0 right-0 w-[110%] h-[40%] opacity-25"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        animate={{ x: ["0%", "6%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.path
          d="M0,300 C400,240 600,360 900,300 C1100,260 1300,340 1440,310"
          fill="none"
          stroke="#00c9a7"
          strokeWidth="1"
          animate={{
            d: [
              "M0,300 C400,240 600,360 900,300 C1100,260 1300,340 1440,310",
              "M0,280 C400,340 600,220 900,280 C1100,320 1300,240 1440,290",
              "M0,300 C400,240 600,360 900,300 C1100,260 1300,340 1440,310",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* Pulsing glow orbs */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00c9a7]/8 blur-[100px] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
          x: ["-50%", "-45%", "-55%", "-50%"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[15%] left-[20%] w-[400px] h-[200px] bg-[#00f2ff]/6 blur-[80px] rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 40, -20, 0],
          y: [0, -20, 10, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-[350px] h-[180px] bg-[#00c9a7]/5 blur-[70px] rounded-full"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.55, 0.25],
          x: [0, -30, 25, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Horizontal scan shimmer */}
      <motion.div
        className="absolute left-0 w-full h-px bg-linear-to-r from-transparent via-[#00f2ff]/30 to-transparent"
        animate={{ top: ["20%", "80%", "20%"], opacity: [0, 0.5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

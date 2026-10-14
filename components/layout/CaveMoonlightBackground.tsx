export function CaveMoonlightBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070b0e]"
    >
      {/* 1. Lakeside Aurora Borealis Sky (Locked Palette: #001D83, #3D276F, #1D1640) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1d1640] via-[#001d83]/40 to-[#070b0e]" />

      {/* Aurora Curtains in Upper Sky */}
      <div className="absolute inset-x-0 -top-10 h-[450px] bg-gradient-to-b from-[#3d276f]/25 via-[#39977f]/20 to-transparent blur-[80px]" />

      {/* The Moon */}
      <div className="absolute top-16 left-[62%] sm:top-20 sm:left-[60%]">
        {/* Soft Moon Halo (Light Mint #B4DAC3 Glow) */}
        <div className="absolute -inset-10 rounded-full bg-[#b4dac3]/15 blur-2xl" />
        <div className="absolute -inset-20 rounded-full bg-[#39977f]/15 blur-3xl" />
        {/* The Moon Body */}
        <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-[#b4dac3] via-[#e8f5ee] to-[#ffffff] shadow-[0_0_35px_rgba(180,218,195,0.45)] sm:h-20 sm:w-20" />
      </div>

      {/* Distant Stars */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 30% 20%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 55% 15%, rgba(180,218,195,0.9), transparent),
            radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 45% 25%, rgba(180,218,195,0.6), transparent),
            radial-gradient(1.5px 1.5px at 65% 40%, rgba(255,255,255,0.75), transparent),
            radial-gradient(1px 1px at 80% 22%, rgba(255,255,255,0.8), transparent)
          `,
          backgroundSize: "600px 400px",
        }}
      />

      {/* 2. Cavern Silhouette Frame */}
      <svg
        className="absolute inset-0 h-full w-full object-cover"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Cavern Wall */}
        <path
          d="M0 0V900C220 900 280 720 250 560C220 400 320 280 280 140C250 40 180 10 0 0Z"
          fill="url(#left-rock-gradient)"
        />
        {/* Right Cavern Wall */}
        <path
          d="M1440 0V900C1220 900 1160 740 1190 580C1220 420 1120 290 1160 150C1190 40 1260 10 1440 0Z"
          fill="url(#right-rock-gradient)"
        />
        {/* Top Cavern Arch Ceiling */}
        <path d="M0 0C350 70 520 95 720 95C920 95 1090 70 1440 0H0Z" fill="#070b0e" />

        <defs>
          <linearGradient
            id="left-rock-gradient"
            x1="0"
            y1="0"
            x2="300"
            y2="600"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#040608" />
            <stop offset="0.7" stopColor="#080e12" />
            <stop offset="1" stopColor="#1d1640" />
          </linearGradient>
          <linearGradient
            id="right-rock-gradient"
            x1="1440"
            y1="0"
            x2="1140"
            y2="600"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#040608" />
            <stop offset="0.7" stopColor="#080e12" />
            <stop offset="1" stopColor="#1d1640" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. Luminous Teal & Mint Aurora Pools (Locked Palette: #39977F & #B4DAC3) */}
      {/* Bottom-left glowing mint mist */}
      <div className="absolute -bottom-24 -left-20 h-[520px] w-[520px] rounded-full bg-radial from-[#39977f]/30 via-[#001d83]/15 to-transparent blur-[120px]" />

      {/* Bottom-right glowing mint mist */}
      <div className="absolute -right-20 -bottom-24 h-[520px] w-[520px] rounded-full bg-radial from-[#b4dac3]/25 via-[#39977f]/15 to-transparent blur-[120px]" />

      {/* Center water reflection ambient illumination */}
      <div className="absolute bottom-0 left-1/2 h-[350px] w-[900px] -translate-x-1/2 bg-gradient-to-t from-[#39977f]/20 via-[#001d83]/15 to-transparent blur-[90px]" />

      {/* Bottom Fog Fade into Dark Obsidian */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070b0e] via-[#070b0e]/80 to-transparent" />
    </div>
  );
}

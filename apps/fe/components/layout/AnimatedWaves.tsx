"use client";

import './AnimatedWaves.css';

export function AnimatedWaves() {
  return (
    <div className="animated-waves-container">
      <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#14142b" />
            <stop offset="100%" stopColor="#0a0a10" />
          </radialGradient>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#aa3bff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#aa3bff" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#aa3bff" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#bg)" />

        {/* Blue/Cyan Waves – Group 1 (drift right) */}
        <g className="wave-group-1" fill="none" strokeWidth="1.5">
          <path stroke="url(#grad1)" strokeOpacity="0.6" d="M0,200 C300,500 600,0 900,300 C1200,600 1350,200 1440,300" />
          <path stroke="url(#grad1)" strokeOpacity="0.5" d="M0,220 C300,520 600,20 900,320 C1200,620 1350,220 1440,320" />
          <path stroke="url(#grad1)" strokeOpacity="0.4" d="M0,240 C300,540 600,40 900,340 C1200,640 1350,240 1440,340" />
          <path stroke="url(#grad1)" strokeOpacity="0.3" d="M0,260 C300,560 600,60 900,360 C1200,660 1350,260 1440,360" filter="url(#glow1)" />
          <path stroke="url(#grad1)" strokeOpacity="0.2" d="M0,280 C300,580 600,80 900,380 C1200,680 1350,280 1440,380" />
        </g>

        {/* Blue/Cyan Waves – Group 2 (drift right, slower) */}
        <g className="wave-group-2" fill="none" strokeWidth="1.5">
          <path stroke="url(#grad1)" strokeOpacity="0.4" d="M0,300 C300,600 600,100 900,400 C1200,700 1350,300 1440,400" />
          <path stroke="url(#grad1)" strokeOpacity="0.3" d="M0,320 C300,620 600,120 900,420 C1200,720 1350,320 1440,420" />
          <path stroke="url(#grad1)" strokeOpacity="0.2" d="M0,340 C300,640 600,140 900,440 C1200,740 1350,340 1440,440" />
          <path stroke="url(#grad1)" strokeOpacity="0.1" d="M0,360 C300,660 600,160 900,460 C1200,760 1350,360 1440,460" />
          <path stroke="url(#grad1)" strokeOpacity="0.05" d="M0,380 C300,680 600,180 900,480 C1200,780 1350,380 1440,480" />
        </g>

        {/* Purple Waves – Group 3 (drift left) */}
        <g className="wave-group-3" fill="none" strokeWidth="1.5">
          <path stroke="url(#grad2)" strokeOpacity="0.6" d="M1440,800 C1140,500 840,1000 540,700 C240,400 90,800 0,700" />
          <path stroke="url(#grad2)" strokeOpacity="0.5" d="M1440,780 C1140,480 840,980 540,680 C240,380 90,780 0,680" />
          <path stroke="url(#grad2)" strokeOpacity="0.4" d="M1440,760 C1140,460 840,960 540,660 C240,360 90,760 0,660" filter="url(#glow1)" />
          <path stroke="url(#grad2)" strokeOpacity="0.3" d="M1440,740 C1140,440 840,940 540,640 C240,340 90,740 0,640" />
          <path stroke="url(#grad2)" strokeOpacity="0.2" d="M1440,720 C1140,420 840,920 540,620 C240,320 90,720 0,620" />
        </g>

        {/* Purple Waves – Group 4 (drift left, slower) */}
        <g className="wave-group-4" fill="none" strokeWidth="1.5">
          <path stroke="url(#grad2)" strokeOpacity="0.4" d="M1440,700 C1140,400 840,900 540,600 C240,300 90,700 0,600" />
          <path stroke="url(#grad2)" strokeOpacity="0.3" d="M1440,680 C1140,380 840,880 540,580 C240,280 90,680 0,580" />
          <path stroke="url(#grad2)" strokeOpacity="0.2" d="M1440,660 C1140,360 840,860 540,560 C240,260 90,660 0,560" />
          <path stroke="url(#grad2)" strokeOpacity="0.1" d="M1440,640 C1140,340 840,840 540,540 C240,240 90,640 0,540" />
          <path stroke="url(#grad2)" strokeOpacity="0.05" d="M1440,620 C1140,320 840,820 540,520 C240,220 90,620 0,520" />
        </g>

        {/* Center crossing waves */}
        <g className="wave-group-5" fill="none" strokeWidth="1.5">
          <path stroke="url(#grad1)" strokeOpacity="0.35" d="M-100,500 C400,300 600,800 1100,400 C1300,200 1400,600 1500,400" />
          <path stroke="url(#grad1)" strokeOpacity="0.25" d="M-100,520 C400,320 600,820 1100,420 C1300,220 1400,620 1500,420" />
        </g>
        <g className="wave-group-6" fill="none" strokeWidth="1.5">
          <path stroke="url(#grad2)" strokeOpacity="0.35" d="M1500,500 C1000,700 800,200 300,600 C100,800 -100,400 -200,600" />
          <path stroke="url(#grad2)" strokeOpacity="0.25" d="M1500,480 C1000,680 800,180 300,580 C100,780 -100,380 -200,580" />
        </g>
      </svg>
    </div>
  );
}

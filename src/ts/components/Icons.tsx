import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const IconDashboard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IconLaptop = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="11" rx="2" />
    <path d="M2 19h20" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M16 20v-1.5A3.5 3.5 0 0012.5 15h-5A3.5 3.5 0 004 18.5V20" />
    <circle cx="10" cy="8" r="3.2" />
    <path d="M20 20v-1.4a3.4 3.4 0 00-2.6-3.3" />
    <path d="M15.6 5.2a3.2 3.2 0 010 5.6" />
  </svg>
);

export const IconClipboard = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 4H7a2 2 0 00-2 2v13a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
    <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
    <path d="M8.5 12h7M8.5 16h4" />
  </svg>
);

export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const IconOnboarding = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 19.5V6a2 2 0 012-2h9l5 5v10.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 013 19.5z" />
    <path d="M14 4v5h5" />
    <path d="M9 14.5l2 2 4-4" />
  </svg>
);

export const IconBox = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 8.2v7.6a2 2 0 01-1 1.7l-7 4a2 2 0 01-2 0l-7-4a2 2 0 01-1-1.7V8.2a2 2 0 011-1.7l7-4a2 2 0 012 0l7 4a2 2 0 011 1.7z" />
    <path d="M3.3 7.4L12 12l8.7-4.6M12 21.5V12" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 9a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
    <path d="M13.7 20a2 2 0 01-3.4 0" />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconMoon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.5 14.3A8.5 8.5 0 019.7 3.5a8.5 8.5 0 1010.8 10.8z" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconArrowUp = (p: IconProps) => (
  <svg {...base({ width: 12, height: 12, strokeWidth: 2.4, ...p })}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const IconArrowDown = (p: IconProps) => (
  <svg {...base({ width: 12, height: 12, strokeWidth: 2.4, ...p })}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const IconMinus = (p: IconProps) => (
  <svg {...base({ width: 12, height: 12, strokeWidth: 2.4, ...p })}>
    <path d="M6 12h12" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 11a8 8 0 10-2.3 5.6" />
    <path d="M20 5v6h-6" />
  </svg>
);

export const IconSwap = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h13l-3-3M20 16H7l3 3" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5.5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6z" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" />
  </svg>
);

export const IconLogo = (p: IconProps) => (
  <svg {...base({ width: 18, height: 18, strokeWidth: 1.8, ...p })}>
    <path d="M12 2.5l3 6.5 6.5 3-6.5 3-3 6.5-3-6.5-6.5-3 6.5-3z" />
  </svg>
);

export const IconExternal = (p: IconProps) => (
  <svg {...base({ width: 14, height: 14, ...p })}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h5" />
  </svg>
);

export const IconChat = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" />
    <path d="M9 11h.01M13 11h.01M17 11h.01" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" />
    <path d="M10 17l-5-5 5-5M5 12h10" />
  </svg>
);

export const IconInbox = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 13h4l2 3h4l2-3h4" />
    <path d="M5 5h14l2 8v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
    <path d="M8 10V7.5a4 4 0 018 0V10" />
    <path d="M12 14v2.5" />
  </svg>
);

export const IconEye = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16" />
    <path d="M10.6 5.7A9.3 9.3 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a17.3 17.3 0 01-3.2 3.9" />
    <path d="M6.3 7.3A16.8 16.8 0 002.5 12S6 18.5 12 18.5a9.3 9.3 0 003.6-.7" />
    <path d="M9.9 9.9a3 3 0 004.2 4.2" />
  </svg>
);

export const IconInventory = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="4" rx="1" />
    <path d="M5 7v13a1 1 0 001 1h12a1 1 0 001-1V7" />
    <path d="M9 11h6M9 15h6" />
  </svg>
);

export const IconList = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);

export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const IconMap = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2z" />
    <path d="M9 3v16M15 5v16" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base({ strokeWidth: 2.2, ...p })}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconUpload = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 20h16" />
  </svg>
);

export const IconEdit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
  </svg>
);
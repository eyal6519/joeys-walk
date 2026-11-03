import type { SVGProps } from 'react';

/**
 * The app's icon system. One drawn set, one stroke (1.75), round caps and
 * joins, 24×24, `currentColor` — so icons inherit the ink of wherever they sit.
 * Emoji are never used as interface icons; these replace them everywhere.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({
  size = 24,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PawIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 13.2c2.3 0 4.2 1.5 4.2 3.3 0 1.4-1.2 2.3-2.7 2.3h-3c-1.5 0-2.7-.9-2.7-2.3 0-1.8 1.9-3.3 4.2-3.3Z" />
      <ellipse cx="6.6" cy="11.2" rx="1.7" ry="2.1" transform="rotate(-18 6.6 11.2)" />
      <ellipse cx="9.8" cy="7.6" rx="1.6" ry="2" />
      <ellipse cx="14.2" cy="7.6" rx="1.6" ry="2" />
      <ellipse cx="17.4" cy="11.2" rx="1.7" ry="2.1" transform="rotate(18 17.4 11.2)" />
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.6 12 4l8 6.6" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
      <path d="M10 20v-5h4v5" />
    </Svg>
  );
}

export function LogbookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 4h11a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 4v16" />
      <path d="M12 9h4M12 13h4" />
    </Svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V6M17 20v-9" />
    </Svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.2v2.1M12 18.7v2.1M4.8 4.8l1.5 1.5M17.7 17.7l1.5 1.5M3.2 12h2.1M18.7 12h2.1M4.8 19.2l1.5-1.5M17.7 6.3l1.5-1.5" />
    </Svg>
  );
}

/** A droplet — what Joey did when he peed. */
export function PeeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5c2.6 3.1 5 6.1 5 8.9a5 5 0 0 1-10 0c0-2.8 2.4-5.8 5-8.9Z" />
    </Svg>
  );
}

/** A soft coil — what Joey did when he pooped. */
export function PoopIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 19.5h10" />
      <path d="M8.2 19.5c-1.6-.3-2.6-1.4-2.4-2.8.2-1.4 1.5-2.4 3-2.5-1.1-.6-1.6-1.7-1.1-2.9.5-1.2 1.9-1.8 3.2-1.4-.9-.7-1.1-2-.3-2.9.8-1 2.2-1.1 3.1-.3.5.5.8 1.1.7 1.8.9-.5 2-.2 2.6.6.6.8.5 1.9-.2 2.6 1.3.4 2.1 1.5 2 2.8-.1 1.3-1.3 2.3-2.8 2.4" />
    </Svg>
  );
}

/** Pee and poop together. */
export function BothIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4.5c1.7 2.1 3.2 4 3.2 5.8a3.2 3.2 0 0 1-6.4 0C4.8 8.5 6.3 6.6 8 4.5Z" />
      <path d="M14.4 20.5h5.6" />
      <path d="M15.4 20.5c-1-.2-1.7-.9-1.5-1.8.1-.9.9-1.5 1.9-1.5-.7-.5-.9-1.3-.5-2.1.4-.8 1.4-1.1 2.2-.7-.5-.7-.5-1.6.2-2.1.6-.5 1.6-.4 2.1.2" />
      <path d="M17 10.2c.6-.6 1.6-.6 2.2.1" />
    </Svg>
  );
}

/** Nothing this time. */
export function NoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
    </Svg>
  );
}

export function WalkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 20c0-4 1.5-5.5 4-7l6-3.5" />
      <circle cx="6" cy="20" r="2.2" />
      <path d="M17 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      <path d="M19.5 10.5 14 13" />
    </Svg>
  );
}

export function TimerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 13V9M9.5 3h5" />
    </Svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21c4-4.4 6-7.5 6-10a6 6 0 0 0-12 0c0 2.5 2 5.6 6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </Svg>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8.5" r="3.3" />
      <path d="M5.5 20c.6-3.4 3.2-5.4 6.5-5.4s5.9 2 6.5 5.4" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 15 7-7 7 7" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 9 7 7 7-7" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="m5 7 7 5 7-5" />
    </Svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v11" />
      <path d="m8 6.5 4-3.5 4 3.5" />
      <path d="M6 11.5H5.5A1.5 1.5 0 0 0 4 13v5.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V13a1.5 1.5 0 0 0-1.5-1.5H18" />
    </Svg>
  );
}

export function CloudOffIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 18h9a4 4 0 0 0 .9-7.9A5.5 5.5 0 0 0 8 8.6" />
      <path d="M4 4.5 20 20.5" />
    </Svg>
  );
}

export function SunRiseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4v3M5.5 7 7 8.5M18.5 7 17 8.5M3 15h2M19 15h2" />
      <path d="M8 15a4 4 0 0 1 8 0" />
      <path d="M3 19h18" />
    </Svg>
  );
}

export function GoogleIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5a6 6 0 0 1-9-3.2H3.2v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.8a6 6 0 0 1 0-3.8V7.4H3.2a10 10 0 0 0 0 9l3.2-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 3.2 7.4L6.4 10A6 6 0 0 1 12 5.9Z"
      />
    </svg>
  );
}

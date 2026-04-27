import type { FC, SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const LoadingIcon: FC<IconSvgProps> = ({
  size,
  width = 200,
  height = 68,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || size}
    height={height || size}
    viewBox="0 0 140 186"
    fill="none"
    {...props}
  >
    <path
      d="M69.7373 0C83.2459 6.32504e-05 95.2638 2.80656 105.79 8.41895C116.316 14.0314 124.65 21.7487 130.79 31.5703C136.93 41.392 140 52.7046 140 65.5078C140 74.9788 138.071 84.7129 134.211 94.71C130.351 104.707 124.298 115.055 116.053 125.754L70.5264 186H25.7891L74.5059 123.11C70.0994 124.169 65.44 124.701 60.5264 124.701C49.2984 124.701 39.1227 122.334 30 117.599C20.8773 112.863 13.5968 106.023 8.1582 97.0781C2.71963 87.958 3.36291e-05 77.1713 0 64.7188C0 51.74 3.15783 40.4267 9.47363 30.7803C15.7894 20.9587 24.2111 13.4169 34.7373 8.15527C45.2635 2.71841 56.9305 0 69.7373 0ZM72.2549 27.4229C71.232 25.724 68.7679 25.7239 67.7451 27.4229L56.8887 45.458C56.5212 46.0683 55.9217 46.5033 55.2275 46.6641L34.7158 51.4131C32.7836 51.8606 32.0221 54.2037 33.3223 55.7012L47.125 71.5957C47.592 72.1336 47.8203 72.8383 47.7588 73.5479L45.9385 94.5186C45.7673 96.4939 47.7607 97.9415 49.5869 97.168L68.9736 88.957C69.6297 88.6792 70.3703 88.6793 71.0264 88.957L90.4131 97.168C92.2394 97.9415 94.2327 96.4939 94.0615 94.5186L92.2412 73.5479C92.1797 72.8383 92.4089 72.1336 92.876 71.5957L106.678 55.7012C107.978 54.2037 107.217 51.8605 105.284 51.4131L84.7725 46.6641C84.0783 46.5033 83.4788 46.0683 83.1113 45.458L72.2549 27.4229Z"
      fill="#25252D"
    />
  </svg>
);

const LOGO_ICON_GRADIENT_ID = "taska-logo-icon-accent";

export const LogoIcon: FC<IconSvgProps> = ({
  size = 65,
  width,
  height,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || size}
    height={height || size}
    viewBox="0 0 70 83"
    fill="none"
    {...props}
  >
    <circle cx="35" cy="41" r="35" fill={`url(#${LOGO_ICON_GRADIENT_ID})`} />
    <path
      d="M42.328 25.136L36.184 62H26.712L32.856 25.136H19.928L21.208 17.328H56.536L55.256 25.136H42.328Z"
      fill="white"
    />
    <defs>
      <linearGradient
        id={LOGO_ICON_GRADIENT_ID}
        x1="15.5"
        y1="12"
        x2="60"
        y2="65"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="var(--primary)" />
        <stop offset="0.5" stopColor="var(--primary)" stopOpacity="0" />
        <stop offset="1" stopColor="var(--primary-highlight)" />
      </linearGradient>
    </defs>
  </svg>
);

export const YandexLogo: FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" 
  width={width || size}
  height={height || size}
  fill="none"
  {...props}
  >
    <path d="M2.04 12c0-5.523 4.476-10 10-10 5.522 0 10 4.477 10 10s-4.478 10-10 10c-5.524 0-10-4.477-10-10z" fill="#FC3F1D" />
    <path d="M13.32 7.666h-.924c-1.694 0-2.585.858-2.585 2.123 0 1.43.616 2.1 1.881 2.959l1.045.704-3.003 4.487H7.49l2.695-4.014c-1.55-1.111-2.42-2.19-2.42-4.015 0-2.288 1.595-3.85 4.62-3.85h3.003v11.868H13.32V7.666z" fill="#fff" />
  </svg>
);

import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

export function HomeIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 11.5L12 4l9 7.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 20v-5.5h4V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function DumbbellIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Rect x="2" y="9" width="3.2" height="6" rx="1" stroke={color} strokeWidth={1.8} />
      <Rect x="18.8" y="9" width="3.2" height="6" rx="1" stroke={color} strokeWidth={1.8} />
      <Rect x="6" y="7.5" width="2.4" height="9" rx="1" stroke={color} strokeWidth={1.8} />
      <Rect x="15.6" y="7.5" width="2.4" height="9" rx="1" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function RulerIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="8" width="18" height="8" rx="1.5" stroke={color} strokeWidth={1.8} transform="rotate(-4 12 12)" />
      <Line x1="7" y1="8.6" x2="7" y2="11.6" stroke={color} strokeWidth={1.6} strokeLinecap="round" transform="rotate(-4 12 12)" />
      <Line x1="10.5" y1="8.3" x2="10.5" y2="10.3" stroke={color} strokeWidth={1.6} strokeLinecap="round" transform="rotate(-4 12 12)" />
      <Line x1="14" y1="8" x2="14" y2="11" stroke={color} strokeWidth={1.6} strokeLinecap="round" transform="rotate(-4 12 12)" />
      <Line x1="17.5" y1="7.7" x2="17.5" y2="9.7" stroke={color} strokeWidth={1.6} strokeLinecap="round" transform="rotate(-4 12 12)" />
    </Svg>
  );
}

export function NutritionIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3v6a2 2 0 0 0 2 2v10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 3v6M8 3v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17 3c-1.7 0-3 2-3 5s1.1 4.5 2 5v8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function UserIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8.5" r="3.6" stroke={color} strokeWidth={1.8} />
      <Path d="M4.8 19.6c.9-3.4 3.7-5.1 7.2-5.1s6.3 1.7 7.2 5.1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ListIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="4.5" cy="6" r="1.3" fill={color} />
      <Circle cx="4.5" cy="12" r="1.3" fill={color} />
      <Circle cx="4.5" cy="18" r="1.3" fill={color} />
      <Line x1="9" y1="6" x2="21" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="9" y1="12" x2="21" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="9" y1="18" x2="21" y2="18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlusIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CloseIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 7l1 13a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9l1-13" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SparkleIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Circle cx="19" cy="17" r="1.4" fill={color} />
    </Svg>
  );
}

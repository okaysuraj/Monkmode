import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function ToriiLogo({ size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Circle cx="22" cy="25" r="8.6" fill="#e0231c" fillOpacity={0.9} />
      <Path
        d="M5 13h34M9 18.4h26M22 8.5v27"
        stroke="#dfe7e0"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M14 35.5h16"
        stroke="#dfe7e0"
        strokeWidth={1.2}
        strokeOpacity={0.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

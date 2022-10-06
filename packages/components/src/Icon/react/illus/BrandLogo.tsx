import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgBrandLogo(props: SvgProps) {
  return (
    <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={240}
    height={240}
    {...props}
  >
    <Path fill="#6d4c41" d="M31 37s.6 3 4 3c-1.8 1.6-4.3 1.7-5 1s1-4 1-4z" />
    <Path
      fill="#6d4c41"
      d="M30 38s-.9 2.7 2 2c8.6-2 13-16 13-16H30v14zm-13.2-1s-.6 3-4 3c1.8 1.6 4.3 1.7 5 1s-1-4-1-4z"
    />
    <Path fill="#6d4c41" d="M17.8 38s.9 2.7-2 2c-8.6-2-13-16-13-16h15v14z" />
    <Path fill="#fb8c00" d="M16 33h16v13H16V33z" />
    <Path fill="#bbdefb" d="m16 40-2 6h7l-5-6zm16 0 2 6h-7l5-6z" />
    <Path
      fill="#ffa726"
      d="M35.8 24.7c.2-.8.5-1.5 1-2.1.4-.5 1.1-.8 1.6-.5.5.3.6 1 .6 1.6v3.1c0 .6 0 1.2-.2 1.7-.2.6-.5 1.1-.9 1.6l-.9 1.2c-.3.4-.6.7-1 .6-.1 0-.3-.1-.4-.3-.2-.2-.4-.4-.7-.6l.9-6.3zm-23.6 0c-.2-.8-.5-1.5-1-2.1-.4-.5-1.1-.8-1.6-.5-.5.3-.6 1-.6 1.6v3.1c0 .6 0 1.2.2 1.7.2.6.5 1.1.9 1.6l.9 1.2c.3.4.6.7 1 .6.1 0 .3-.1.4-.3.2-.2.4-.4.7-.6l-.9-6.3z"
    />
    <Path
      fill="#fb8c00"
      d="M38 26c0 2.1-1 3-1 3v-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1zm-28 0c0 2.1 1 3 1 3v-2c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1z"
    />
    <Path
      fill="#ffb74d"
      d="M22 43c-3.1 0-10-7.8-10-11V15s.3-8 12-8 12 8 12 8v17c0 3.1-7.1 11-10 11h-4z"
    />
    <Path fill="#fb8c00" d="M20 34h8v2h-8z" />
    <Path
      fill="#8d6e63"
      d="M39.9 16.9C39.4 11 36.6 2.1 29 2c-2.1 0-3 1-3 1-1-.8-3-1-3-1-9.2 0-13 7.5-13 18l3 1.3s8-3 8-13.3c0 11.1 14 12 14 12v1.3c0 3.7 1.3 6.8 5 6.8 0 0 3.4.1 5-4-3.9-.1-5-6.6-5.1-7.2"
    />
    <Path
      fill="#8d6e63"
      d="M8.1 16.9C8.6 11 14.4 2.1 22 2c2.1 0-9 17-9 17v2.3C13 25 11.7 28 8 28c0 0-3.4.1-5-4 3.9 0 5-6.5 5.1-7.1"
    />
    <Path
      fill="#784719"
      d="M31 24.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5m-11 0c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5"
    />
    <Path fill="#8d6e63" d="M21 9s-1.3 12 8 12c-8.1-2.9-6-11-6-11l-2-1z" />
  </Svg>
  );
}

export default SvgBrandLogo;

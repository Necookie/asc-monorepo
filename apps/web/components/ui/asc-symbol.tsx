import * as React from 'react';
import { ASC_ARCH, ASC_BRIDGE, ASC_NODES, markPath } from '../../lib/asc-mark';

/** The same three-node silhouette as the original ASC artwork and WebGL emblem. */
export function AscSymbol({ color = false }: { color?: boolean }) {
  const id = React.useId();
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {color && <defs>
      <linearGradient id={`${id}-base`} x1="8" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6348f5" /><stop offset="1" stopColor="#ee35d2" />
      </linearGradient>
      <linearGradient id={`${id}-crown`} x1="32" y1="12" x2="32" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#30d5f4" /><stop offset="1" stopColor="#30d5f4" stopOpacity="0" />
      </linearGradient>
    </defs>}
    <g fill={color ? `url(#${id}-base)` : 'currentColor'}>
      <path d={markPath(ASC_ARCH)} />
      <path d={markPath(ASC_BRIDGE)} />
      {ASC_NODES.map(node => <circle key={node.name} cx={node.x} cy={node.y} r={node.radius} />)}
    </g>
    {color && <path d={markPath(ASC_ARCH)} fill={`url(#${id}-crown)`} />}
  </svg>;
}

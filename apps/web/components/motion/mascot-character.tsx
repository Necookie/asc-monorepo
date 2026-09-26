'use client';

import { useId } from 'react';

export type MascotMood = 'idle' | 'wave' | 'happy' | 'celebrate' | 'sleep' | 'wake' | 'held' | 'land';

// Partitions follow the original artwork; all parts share one decoded image.
const HEAD = 'M210 0H960V550L852 608L710 650L552 692L453 679L294 637L310 584L229 538L210 460Z';
const PAW = 'M0 380H210L238 540L292 596L360 645L307 860H0Z';
const TAIL = 'M941 724H1177V1240H818L805 1145L837 1080L940 1005L961 928Z';

export function MascotCharacter({ mood, reactionKey }: { mood: MascotMood; reactionKey: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="community-mascot-sprite" viewBox="-65 -55 1310 1450" aria-hidden="true" focusable="false" data-mood={mood}>
      <defs>
        <image id={`${id}-art`} href="/mascot/cat-arcade-v2.webp" width="1177" height="1337" />
        <clipPath id={`${id}-head`}><path d={HEAD} /></clipPath>
        <clipPath id={`${id}-paw`}><path d={PAW} /></clipPath>
        <clipPath id={`${id}-tail`}><path d={TAIL} /></clipPath>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1177" height="1337">
          <rect width="1177" height="1337" fill="white" />
          <path d={HEAD} fill="black" /><path d={PAW} fill="black" /><path d={TAIL} fill="black" />
        </mask>
      </defs>
      <g className="mascot-body" key={reactionKey}>
        <g className="mascot-tail"><use href={`#${id}-art`} clipPath={`url(#${id}-tail)`} /></g>
        {/* Concealed shoulder joint fills the space exposed by the raised sleeve. */}
        <ellipse cx="323" cy="729" rx="35" ry="80" fill="#293651" />
        <use href={`#${id}-art`} mask={`url(#${id}-body)`} />
        <g className="mascot-paw"><use href={`#${id}-art`} clipPath={`url(#${id}-paw)`} /></g>
        <g className="mascot-look"><g className="mascot-head">
          <use href={`#${id}-art`} clipPath={`url(#${id}-head)`} />
          <g className="mascot-eyelid">
            <path d="M336 428Q376 385 437 414Q475 450 463 514Q447 536 407 527Q351 515 336 468Z" fill="#f7f7f7" />
            <path d="M356 477Q400 442 449 477" fill="none" stroke="#111111" strokeWidth="12" strokeLinecap="round" />
          </g>
        </g></g>
      </g>
    </svg>
  );
}

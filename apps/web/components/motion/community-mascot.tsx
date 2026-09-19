'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const CLASSMATES = [
  {
    name: 'Vee',
    skin: '#8d5524',
    hair: '#17152b',
    hoodie: '#5865f2',
    accent: '#35ed7e',
    notebook: '#ec48bd',
  },
  {
    name: 'Mika',
    skin: '#f1c27d',
    hair: '#512d38',
    hoodie: '#ec48bd',
    accent: '#00b0f4',
    notebook: '#5865f2',
  },
  {
    name: 'Sol',
    skin: '#c68642',
    hair: '#20233f',
    hoodie: '#00b0f4',
    accent: '#f0b232',
    notebook: '#35ed7e',
  },
  {
    name: 'Kit',
    skin: '#6f4a3b',
    hair: '#101327',
    hoodie: '#35ed7e',
    accent: '#5865f2',
    notebook: '#00b0f4',
  },
] as const;

type Side = 'left' | 'right';

function StudentIllustration({
  classmate,
  side,
  reduceMotion,
}: {
  classmate: (typeof CLASSMATES)[number];
  side: Side;
  reduceMotion: boolean | null;
}) {
  return (
    <svg
      viewBox="0 0 150 220"
      aria-hidden="true"
      className={`h-auto w-full overflow-visible drop-shadow-[0_16px_24px_rgba(5,7,30,0.48)] ${
        side === 'right' ? '-scale-x-100' : ''
      }`}
    >
      <g>
        {/* Backpack and notebook give the mascot an unmistakable student silhouette. */}
        <path
          d="M91 115c22 2 34 20 32 47l-4 38H89z"
          fill="#141843"
          stroke="#070928"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M104 143l25-9 12 48-29 9z"
          fill={classmate.notebook}
          stroke="#070928"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M113 151l18-6M116 162l18-6" stroke="#f4f1ff" strokeWidth="3" strokeLinecap="round" opacity=".8" />

        {/* Reaching arm and hand wrap around the website edge. */}
        <path
          d="M36 132C18 137 8 154 9 177"
          fill="none"
          stroke={classmate.hoodie}
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M10 168c8-2 15 3 16 10 1 8-4 14-12 15-8 0-13-5-12-13"
          fill={classmate.skin}
          stroke="#070928"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Torso and uniform-inspired hoodie. */}
        <path
          d="M34 121c10-13 24-18 41-18 24 0 42 14 46 42l5 61H28l2-58c0-10 1-19 4-27z"
          fill={classmate.hoodie}
          stroke="#070928"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M59 108l15 25 17-25"
          fill="#f4f1ff"
          stroke="#070928"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M74 133v31" stroke="#070928" strokeWidth="5" strokeLinecap="round" />
        <path d="M74 136l-9 18 9 9 9-9z" fill={classmate.accent} stroke="#070928" strokeWidth="4" strokeLinejoin="round" />
        <path d="M46 187c17 6 36 6 58 0" fill="none" stroke="#070928" strokeWidth="5" strokeLinecap="round" opacity=".55" />

        {/* Head, hair and face. */}
        <path
          d="M40 60c0-29 18-48 44-48 27 0 43 20 41 50l-3 24c-3 22-21 36-43 36-24 0-39-16-40-39z"
          fill={classmate.skin}
          stroke="#070928"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M41 64C32 32 50 8 83 8c31 0 48 20 43 54-8-3-15-10-19-22-11 12-31 18-66 24z"
          fill={classmate.hair}
          stroke="#070928"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path d="M45 52c-9 2-14 11-12 21 2 9 7 14 15 13" fill={classmate.skin} stroke="#070928" strokeWidth="5" strokeLinecap="round" />
        <m.g
          animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.12, 1, 1] }}
          transition={{ duration: 0.28, repeat: Infinity, repeatDelay: 3.8 }}
          style={{ transformOrigin: '82px 73px' }}
        >
          <path d="M68 72h1M98 72h1" stroke="#070928" strokeWidth="7" strokeLinecap="round" />
        </m.g>
        <path d="M78 91c7 5 15 4 21-2" fill="none" stroke="#070928" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 61c5-4 11-5 16-2M93 59c5-2 10-1 14 3" fill="none" stroke="#070928" strokeWidth="4" strokeLinecap="round" />

        {/* Club pin. */}
        <circle cx="105" cy="151" r="11" fill="#f4f1ff" stroke="#070928" strokeWidth="4" />
        <path d="M99 156l6-13 6 13M102 151h7" fill="none" stroke={classmate.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function CommunityMascot() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [side, setSide] = React.useState<Side>('left');
  const [showHint, setShowHint] = React.useState(false);

  const hiddenRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/not-a-member');

  React.useEffect(() => {
    try {
      const savedIndex = Number(window.localStorage.getItem('asc-classmate:v1:index'));
      const savedSide = window.localStorage.getItem('asc-classmate:v1:side');
      const hasMetMascot = window.localStorage.getItem('asc-classmate:v1:met') === 'true';

      if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < CLASSMATES.length) {
        setIndex(savedIndex);
      }
      if (savedSide === 'left' || savedSide === 'right') {
        setSide(savedSide);
      }
      setShowHint(!hasMetMascot);
    } catch {
      setShowHint(true);
    }
  }, []);

  if (hiddenRoute) return null;

  const classmate = CLASSMATES[index];

  const switchClassmate = () => {
    const nextIndex = (index + 1) % CLASSMATES.length;
    const nextSide: Side = side === 'left' ? 'right' : 'left';

    setIndex(nextIndex);
    setSide(nextSide);
    setShowHint(false);

    try {
      window.localStorage.setItem('asc-classmate:v1:index', String(nextIndex));
      window.localStorage.setItem('asc-classmate:v1:side', nextSide);
      window.localStorage.setItem('asc-classmate:v1:met', 'true');
    } catch {
      // The mascot remains fully usable when storage is unavailable.
    }
  };

  return (
    <div className="community-mascot-layer" aria-live="polite">
      <AnimatePresence initial={false} mode="wait">
        <m.button
          key={`${side}-${index}`}
          type="button"
          onClick={switchClassmate}
          className={`community-mascot ${side === 'left' ? 'community-mascot--left' : 'community-mascot--right'}`}
          aria-label={`Switch classmate. ${classmate.name} is visiting now.`}
          title={`Meet another ASC classmate. This is ${classmate.name}.`}
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, x: side === 'left' ? -54 : 54, rotate: side === 'left' ? -6 : 6 }
          }
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, x: side === 'left' ? -48 : 48, scale: 0.94 }
          }
          whileHover={reduceMotion ? undefined : { scale: 1.035 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: EASE_OUT_EXPO }}
        >
          <AnimatePresence>
            {showHint && (
              <m.span
                className={`community-mascot__hint ${side === 'left' ? 'community-mascot__hint--left' : 'community-mascot__hint--right'}`}
                initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: 0.65, ease: EASE_OUT_EXPO }}
              >
                Tap to meet the club
              </m.span>
            )}
          </AnimatePresence>

          <m.span
            className="block"
            animate={reduceMotion ? undefined : { y: [0, -3, 0], rotate: [0, -0.8, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <StudentIllustration
              classmate={classmate}
              side={side}
              reduceMotion={reduceMotion}
            />
          </m.span>
          <span className="sr-only">Current classmate: {classmate.name}</span>
        </m.button>
      </AnimatePresence>
    </div>
  );
}

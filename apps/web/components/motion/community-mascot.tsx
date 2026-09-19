'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export type MascotPoseId = 'coding' | 'studying' | 'chill' | 'front';

export interface MascotPose {
  id: MascotPoseId;
  name: string;
  badge: string;
  src: string;
  width: number;
  height: number;
  dialogues: string[];
  hint: string;
  /** Natural facing direction: 'left', 'right', or 'front' */
  naturalFacing: 'left' | 'right' | 'front';
}

export const MASCOT_POSES: readonly MascotPose[] = [
  {
    id: 'coding',
    name: 'Coding Cat',
    badge: 'Code </> Mode',
    src: '/mascot/cat-coding.png',
    width: 853,
    height: 907,
    dialogues: [
      'Code </> Create 💻',
      'Typing at 120 WPM! 🐾',
      'if (idea) { code(); } ✨',
      'Git push --force-with-love 🚀',
    ],
    hint: 'Tap to dash & switch pose! 🐾',
    naturalFacing: 'left',
  },
  {
    id: 'studying',
    name: 'Studying Cat',
    badge: 'Study Session 📖',
    src: '/mascot/cat-studying.png',
    width: 850,
    height: 906,
    dialogues: [
      'Good ideas take time! 🐾',
      'Check out my pink toe beans! ✨',
      'Studying for the club today 🎓',
      'More than grades 💡',
    ],
    hint: 'Flip to the next pose! 🐾',
    naturalFacing: 'front',
  },
  {
    id: 'chill',
    name: 'Chill Cat',
    badge: 'Chill Recharge 💤',
    src: '/mascot/cat-chill.png',
    width: 857,
    height: 837,
    dialogues: [
      'Zzz... cat nap recharge 💤',
      'Chillin\' with big ideas 🎧',
      'Break time between commits 🌙',
      'Purr-fectly relaxed 🐾',
    ],
    hint: 'Wake me up with a tap! 🐾',
    naturalFacing: 'left',
  },
  {
    id: 'front',
    name: 'ASC Academy Leader',
    badge: 'After School Club 🎒',
    src: '/mascot/cat-front.png',
    width: 799,
    height: 907,
    dialogues: [
      'Welcome to After School Club! 🎒',
      'Same students. Brighter ideas! 💡',
      'Students today, greater tomorrow 🌟',
      'Keep me movin\'! 🐾',
    ],
    hint: 'Click me to keep movin\'! 🚀',
    naturalFacing: 'front',
  },
] as const;

interface ClickParticle {
  id: number;
  symbol: string;
  x: number;
  y: number;
}

const PARTICLE_SYMBOLS = ['🐾', '✨', '💡', '</>', '⭐', '❤️'];

export function CommunityMascot() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [mounted, setMounted] = React.useState(false);
  const [poseIndex, setPoseIndex] = React.useState(0);
  const [dialogueIndex, setDialogueIndex] = React.useState(0);
  const [side, setSide] = React.useState<'left' | 'right'>('left');
  const [isDashing, setIsDashing] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showSpeech, setShowSpeech] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(1200);
  const [particles, setParticles] = React.useState<ClickParticle[]>([]);

  const hiddenRoute = Boolean(
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/not-a-member')
  );

  // Measure window width for dynamic edge-to-edge travel
  React.useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Restore saved preferences
  React.useEffect(() => {
    try {
      const savedPose = Number(window.localStorage.getItem('asc-cat-mascot:v2:pose'));
      const savedSide = window.localStorage.getItem('asc-cat-mascot:v2:side');
      const hasMet = window.localStorage.getItem('asc-cat-mascot:v2:met') === 'true';

      if (Number.isInteger(savedPose) && savedPose >= 0 && savedPose < MASCOT_POSES.length) {
        setPoseIndex(savedPose);
      }
      if (savedSide === 'left' || savedSide === 'right') {
        setSide(savedSide);
      }
      // Show initial greeting on first visit
      if (!hasMet) {
        setShowSpeech(true);
      }
    } catch {
      setShowSpeech(true);
    }
  }, []);

  // Periodic autonomous roaming / wandering ("kee it movin lol")
  React.useEffect(() => {
    if (reduceMotion) return;

    // Periodically dash across the screen if not hovered
    const roamInterval = window.setInterval(() => {
      if (!isHovered && !isDashing) {
        triggerMove(false);
      }
    }, 11000);

    return () => window.clearInterval(roamInterval);
  }, [side, isHovered, isDashing, poseIndex, reduceMotion]);

  const currentPose = MASCOT_POSES[poseIndex];

  // Trigger movement and pose change
  const triggerMove = (interactive = true) => {
    if (isDashing) return;

    const nextSide = side === 'left' ? 'right' : 'left';
    const nextPoseIndex = (poseIndex + 1) % MASCOT_POSES.length;
    const nextDialogue = (dialogueIndex + 1) % MASCOT_POSES[nextPoseIndex].dialogues.length;

    setIsDashing(true);
    setSide(nextSide);
    setPoseIndex(nextPoseIndex);
    setDialogueIndex(nextDialogue);
    setShowSpeech(true);

    try {
      window.localStorage.setItem('asc-cat-mascot:v2:pose', String(nextPoseIndex));
      window.localStorage.setItem('asc-cat-mascot:v2:side', nextSide);
      window.localStorage.setItem('asc-cat-mascot:v2:met', 'true');
    } catch {
      // Storage unavailable fallback
    }

    // Reset dashing flag after transit finishes
    window.setTimeout(() => {
      setIsDashing(false);
    }, 850);
  };

  const handleMascotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Generate celebratory click particles
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const newParticles: ClickParticle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      symbol: PARTICLE_SYMBOLS[Math.floor(Math.random() * PARTICLE_SYMBOLS.length)],
      x: clickX + (Math.random() * 40 - 20),
      y: clickY + (Math.random() * 20 - 10),
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 900);

    triggerMove(true);
  };

  if (hiddenRoute || !mounted) return null;

  // Horizontal target position
  const isMobile = windowWidth < 640;
  const mascotWidth = isMobile ? 96 : 134;
  const paddingEdge = isMobile ? 12 : 28;
  const targetX = side === 'left' ? paddingEdge : Math.max(paddingEdge, windowWidth - mascotWidth - paddingEdge);

  // Calculate facing direction:
  // When looking inward towards the screen content:
  // Left side -> Face right (inward)
  // Right side -> Face left (inward)
  let scaleX = 1;
  if (currentPose.naturalFacing === 'left') {
    scaleX = side === 'left' ? -1 : 1;
  } else if (currentPose.naturalFacing === 'right') {
    scaleX = side === 'left' ? 1 : -1;
  } else {
    // Front facing cat tilts slightly towards the center
    scaleX = 1;
  }

  // During dash across, face the movement direction
  if (isDashing) {
    const movingToRight = side === 'right';
    if (currentPose.naturalFacing === 'left') {
      scaleX = movingToRight ? -1 : 1;
    } else {
      scaleX = movingToRight ? 1 : -1;
    }
  }

  const currentDialogue = currentPose.dialogues[dialogueIndex % currentPose.dialogues.length];

  return (
    <div className="community-mascot-layer" aria-live="polite">
      {/* Dynamic Runner Container: Animates across the screen */}
      <m.div
        className="community-mascot-runner"
        animate={{
          x: targetX,
        }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : {
                type: 'spring',
                stiffness: 72,
                damping: 14,
                mass: 0.8,
              }
        }
      >
        <m.button
          type="button"
          onClick={handleMascotClick}
          onMouseEnter={() => {
            setIsHovered(true);
            setShowSpeech(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          className="community-mascot-btn group"
          aria-label={`After School Club Mascot: ${currentPose.name}. Click to dash across and switch pose.`}
          title={`After School Club Mascot: ${currentPose.name} (Click to keep me movin'!)`}
          whileHover={reduceMotion ? undefined : { scale: 1.08 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        >
          {/* Interactive Speech / Thought Bubble */}
          <AnimatePresence>
            {(showSpeech || isHovered) && (
              <m.div
                key={`bubble-${poseIndex}-${dialogueIndex}`}
                className={`community-mascot-bubble ${
                  side === 'left' ? 'community-mascot-bubble--left' : 'community-mascot-bubble--right'
                }`}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
                transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#35ed7e] animate-pulse" />
                  <span className="text-[10px] font-mono tracking-wider text-[#a2a8d3] uppercase font-semibold">
                    {currentPose.badge}
                  </span>
                </div>
                <div className="text-[12px] font-bold text-[#f4f1ff] leading-snug">
                  {currentDialogue}
                </div>
                <div className="mt-1.5 text-[9px] text-[#717bb5] flex items-center gap-1 font-medium">
                  <span>🐾</span>
                  <span>{currentPose.hint}</span>
                </div>

                {/* Speech Bubble Arrow */}
                <div
                  className={`community-mascot-bubble-arrow ${
                    side === 'left' ? 'community-mascot-bubble-arrow--left' : 'community-mascot-bubble-arrow--right'
                  }`}
                />
              </m.div>
            )}
          </AnimatePresence>

          {/* Click Burst Particles */}
          <AnimatePresence>
            {particles.map((p) => (
              <m.span
                key={p.id}
                className="pointer-events-none absolute select-none text-base font-bold z-50 drop-shadow-[0_2px_8px_rgba(88,101,242,0.8)]"
                initial={{ opacity: 1, x: p.x - 12, y: p.y - 12, scale: 0.5 }}
                animate={{
                  opacity: 0,
                  x: p.x - 12 + (Math.random() * 40 - 20),
                  y: p.y - 50 - Math.random() * 30,
                  scale: 1.25,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
              >
                {p.symbol}
              </m.span>
            ))}
          </AnimatePresence>

          {/* Character Wrapper: Continuous organic float + dash jump */}
          <m.div
            className="community-mascot-sprite-wrap"
            animate={
              reduceMotion
                ? undefined
                : isDashing
                ? {
                    y: [0, -32, 4, -12, 0],
                    rotate: side === 'left' ? [0, -8, 4, 0] : [0, 8, -4, 0],
                  }
                : {
                    // Continuous alive floating & breathing wave
                    y: [0, -11, 2, -8, 0],
                    rotate: isHovered
                      ? [-2, 2, -2]
                      : side === 'left'
                      ? [-1.5, 2, -1, 1.5, -1.5]
                      : [1.5, -2, 1, -1.5, 1.5],
                  }
            }
            transition={
              isDashing
                ? { duration: 0.8, ease: EASE_OUT_EXPO }
                : {
                    duration: 3.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
            style={{
              transformOrigin: 'center bottom',
            }}
          >
            {/* Facing direction flip */}
            <div
              style={{
                transform: `scaleX(${scaleX})`,
                transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="relative select-none"
            >
              {/* Subtle ambient backglow */}
              <div className="absolute inset-0 -z-10 rounded-full bg-[#5865f2]/15 blur-xl group-hover:bg-[#5865f2]/30 transition-all duration-300" />

              {/* Official After School Club Cat Asset */}
              <img
                src={currentPose.src}
                alt={currentPose.name}
                width={currentPose.width}
                height={currentPose.height}
                draggable={false}
                className="h-auto w-full select-none object-contain drop-shadow-[0_16px_28px_rgba(5,7,30,0.65)] filter transition-all duration-200 group-hover:brightness-105"
              />
            </div>
          </m.div>

          <span className="sr-only">
            ASC Community Mascot: {currentPose.name}. Click to switch poses and keep it moving.
          </span>
        </m.button>
      </m.div>
    </div>
  );
}

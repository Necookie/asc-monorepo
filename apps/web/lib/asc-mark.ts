/** Traced from public/asc-logo-full.png. Shared by the flat mark and 3D sculpture. */
export type MarkCommand = ['M' | 'L', number, number] | ['C', number, number, number, number, number, number];

export const ASC_ARCH: MarkCommand[] = [
  ['M', 8, 47],
  ['L', 25.3, 16.3],
  ['C', 28.3, 10.4, 35.7, 10.4, 38.7, 16.3],
  ['L', 56, 47],
  ['L', 46.5, 52.5],
  ['L', 32, 23.5],
  ['L', 17.5, 52.5],
];

export const ASC_BRIDGE: MarkCommand[] = [
  ['M', 12.5, 48.4],
  ['C', 20, 43.7, 26.2, 41.5, 32, 41.5],
  ['C', 37.8, 41.5, 44, 43.7, 51.5, 48.4],
  ['L', 51.5, 51.3],
  ['C', 44, 46.9, 37.8, 44.5, 32, 44.5],
  ['C', 26.2, 44.5, 20, 46.9, 12.5, 51.3],
];

export const ASC_NODES = [
  { name: 'left', x: 12.5, y: 50, radius: 6.8 },
  { name: 'center', x: 32, y: 43, radius: 5.5 },
  { name: 'right', x: 51.5, y: 50, radius: 6.8 },
] as const;

export const markPath = (commands: MarkCommand[]) => `${commands.map(command => command.join(' ')).join(' ')} Z`;

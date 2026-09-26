import * as React from 'react';

// Server-rendered content remains readable before hydration; CSS handles local entrances.
export function PageMotion({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full">{children}</div>;
}

import { NextResponse } from 'next/server';
import { db } from '@asc/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    await db.run(sql`SELECT 1`);
    const dbLatency = Date.now() - start;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          latencyMs: dbLatency,
        },
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown database error',
        },
        uptime: process.uptime(),
      },
      { status: 503 }
    );
  }
}

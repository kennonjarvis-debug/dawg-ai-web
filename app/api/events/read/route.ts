/**
 * GET /api/events/read?date=YYYY-MM-DD
 * Read events from GitOps event bus
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const busDir = path.join(process.cwd(), '_bus', 'events', date);
    const eventFilePath = path.join(busDir, 'events.jsonl');

    try {
      const fileContent = await fs.readFile(eventFilePath, 'utf-8');
      const lines = fileContent.trim().split('\n');
      const events = lines.map((line) => JSON.parse(line));

      return NextResponse.json(events);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // No events for this date
        return NextResponse.json([]);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error reading events:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

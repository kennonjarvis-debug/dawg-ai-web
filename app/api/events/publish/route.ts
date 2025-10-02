/**
 * POST /api/events/publish
 * Publish event to GitOps event bus
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, event } = body;

    if (!date || !event) {
      return NextResponse.json(
        { error: 'Missing date or event' },
        { status: 400 }
      );
    }

    // Validate event structure
    if (!event.event || !event.version || !event.producer || !event.payload) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Write to GitOps event bus
    const busDir = path.join(process.cwd(), '_bus', 'events', date);
    const eventFilePath = path.join(busDir, 'events.jsonl');

    // Ensure directory exists
    await fs.mkdir(busDir, { recursive: true });

    // Append event as JSON Line
    const eventLine = JSON.stringify(event) + '\n';
    await fs.appendFile(eventFilePath, eventLine);

    return NextResponse.json({
      success: true,
      event_id: event.id,
      timestamp: event.ts,
    });
  } catch (error: any) {
    console.error('Error publishing event:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

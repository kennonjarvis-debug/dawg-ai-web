/**
 * useVoiceEventBus - Hook to integrate voice commands with GitOps event bus
 *
 * Publishes voice.command events and listens for agent responses
 */

'use client';

import { useCallback } from 'react';

interface VoiceCommandEvent {
  event: 'voice.command';
  version: 'v1';
  id: string;
  trace_id: string;
  producer: string;
  ts: string;
  signature: string;
  payload: {
    agent: string;
    command: string;
    transcript: string;
    user_id?: string;
  };
}

interface AgentResponseEvent {
  event: 'agent.response';
  version: 'v1';
  id: string;
  trace_id: string;
  producer: string;
  ts: string;
  signature: string;
  payload: {
    agent: string;
    response: string;
    context?: any;
  };
}

export function useVoiceEventBus() {
  const publishVoiceCommand = useCallback(async (agent: string, command: string, transcript: string) => {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const traceId = `tr_voice_${Date.now()}`;

    const event: VoiceCommandEvent = {
      event: 'voice.command',
      version: 'v1',
      id: eventId,
      trace_id: traceId,
      producer: 'voice-interface',
      ts: new Date().toISOString(),
      signature: 'UNSIGNED_DEV_MODE',
      payload: {
        agent,
        command,
        transcript,
      },
    };

    try {
      // Write to GitOps event bus
      const date = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/events/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          event,
        }),
      });

      if (!response.ok) {
        console.error('Failed to publish voice command event');
      }

      return eventId;
    } catch (error) {
      console.error('Error publishing voice command:', error);
      return null;
    }
  }, []);

  const publishAgentResponse = useCallback(async (agent: string, response: string, context?: any) => {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const traceId = `tr_voice_${Date.now()}`;

    const event: AgentResponseEvent = {
      event: 'agent.response',
      version: 'v1',
      id: eventId,
      trace_id: traceId,
      producer: agent,
      ts: new Date().toISOString(),
      signature: 'UNSIGNED_DEV_MODE',
      payload: {
        agent,
        response,
        context,
      },
    };

    try {
      const date = new Date().toISOString().split('T')[0];
      const apiResponse = await fetch('/api/events/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          event,
        }),
      });

      if (!apiResponse.ok) {
        console.error('Failed to publish agent response event');
      }

      return eventId;
    } catch (error) {
      console.error('Error publishing agent response:', error);
      return null;
    }
  }, []);

  const readEvents = useCallback(async (date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/events/read?date=${targetDate}`);

      if (!response.ok) {
        console.error('Failed to read events');
        return [];
      }

      const events = await response.json();
      return events;
    } catch (error) {
      console.error('Error reading events:', error);
      return [];
    }
  }, []);

  return {
    publishVoiceCommand,
    publishAgentResponse,
    readEvents,
  };
}

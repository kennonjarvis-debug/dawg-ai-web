/**
 * VoiceInterface - Voice command system for DAWG AI
 *
 * Wake word detection: "Hey Alexis", "Hey Tom", "Hey Jerry", "Hey Karen"
 * Speech-to-text for commands, TTS for agent responses
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './VoiceInterface.module.css';

interface VoiceInterfaceProps {
  onAgentCommand?: (agent: string, command: string) => void;
  onAgentResponse?: (agent: string, response: string) => void;
}

type Agent = 'alexis' | 'tom' | 'jerry' | 'karen';

interface AgentProfile {
  name: string;
  fullName: string;
  role: string;
  wakeWords: string[];
  voiceId?: string; // For TTS
}

const AGENTS: Record<Agent, AgentProfile> = {
  alexis: {
    name: 'Alexis',
    fullName: 'Alexis (Planner)',
    role: 'Task planning & backlog management',
    wakeWords: ['hey alexis', 'alexis'],
  },
  tom: {
    name: 'Tom',
    fullName: 'Tom (Audio Engine)',
    role: 'Audio widgets & vocal coaching',
    wakeWords: ['hey tom', 'tom'],
  },
  jerry: {
    name: 'Jerry',
    fullName: 'Jerry (Instance 3)',
    role: 'Backend integration',
    wakeWords: ['hey jerry', 'jerry'],
  },
  karen: {
    name: 'Karen',
    fullName: 'Karen (Profile Manager)',
    role: 'User profiles & privacy',
    wakeWords: ['hey karen', 'karen'],
  },
};

export function VoiceInterface({ onAgentCommand, onAgentResponse }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [lastResponse, setLastResponse] = useState('');
  const [status, setStatus] = useState<string>('Ready');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = (finalTranscript + interimTranscript).toLowerCase().trim();
          setTranscript(fullTranscript);

          // Check for wake words
          if (finalTranscript) {
            detectWakeWord(fullTranscript.toLowerCase().trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setStatus(`Error: ${event.error}`);
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start(); // Auto-restart
          }
        };

        recognitionRef.current = recognition;
      }

      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const detectWakeWord = useCallback((text: string) => {
    for (const [agentKey, agent] of Object.entries(AGENTS)) {
      for (const wakeWord of agent.wakeWords) {
        if (text.includes(wakeWord)) {
          const command = text.replace(wakeWord, '').trim();
          if (command) {
            handleAgentCommand(agentKey as Agent, command);
          } else {
            setActiveAgent(agentKey as Agent);
            setStatus(`Listening to ${agent.name}...`);
            speak(`Hi, I'm ${agent.name}. How can I help?`);
          }
          return;
        }
      }
    }
  }, []);

  const handleAgentCommand = (agent: Agent, command: string) => {
    setActiveAgent(agent);
    setStatus(`${AGENTS[agent].name}: ${command}`);

    if (onAgentCommand) {
      onAgentCommand(agent, command);
    }

    // Mock response (in real app, this would come from event bus)
    const mockResponse = generateMockResponse(agent, command);
    setLastResponse(mockResponse);
    speak(mockResponse);

    if (onAgentResponse) {
      onAgentResponse(agent, mockResponse);
    }
  };

  const generateMockResponse = (agent: Agent, command: string): string => {
    const responses: Record<Agent, Record<string, string>> = {
      alexis: {
        default: "I'm tracking all tasks on the event bus. What would you like to prioritize?",
        status: "We have 6 Priority 2 tasks ready. Tom is working on voice interface.",
        tasks: "Current tasks: VoicematchVisualizer, Real-time Audio Integration, and 4 others.",
      },
      tom: {
        default: "I'm Tom, the audio engine specialist. I can help with vocal coaching widgets.",
        status: "Just finished 5 widgets: coaching panel, performance scorer, and exercise library.",
        widgets: "I've built LiveCoachingPanel, PerformanceScorer, WaveformAnnotations, AutoCompingTool, and ExerciseLibrary.",
      },
      jerry: {
        default: "I'm Jerry, handling backend integration. What do you need?",
        status: "Backend services are running. Event bus is operational.",
      },
      karen: {
        default: "I'm Karen, managing user profiles and privacy. How can I assist?",
        status: "Profile system initialized. All data is GDPR compliant.",
        profile: "User profiles include vocal range tracking and practice analytics.",
      },
    };

    const agentResponses = responses[agent];
    for (const [key, response] of Object.entries(agentResponses)) {
      if (command.includes(key)) {
        return response;
      }
    }

    return agentResponses.default;
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatus('Stopped');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setStatus('Listening for wake words...');
      setTranscript('');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>🎤 Voice Interface</div>
        <div className={styles.status}>{status}</div>
      </div>

      {/* Active Agent */}
      {activeAgent && (
        <div className={styles.activeAgent}>
          <div className={styles.agentName}>{AGENTS[activeAgent].fullName}</div>
          <div className={styles.agentRole}>{AGENTS[activeAgent].role}</div>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className={styles.transcript}>
          <div className={styles.transcriptLabel}>You said:</div>
          <div className={styles.transcriptText}>{transcript}</div>
        </div>
      )}

      {/* Last Response */}
      {lastResponse && (
        <div className={styles.response}>
          <div className={styles.responseLabel}>Response:</div>
          <div className={styles.responseText}>{lastResponse}</div>
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.listenButton} ${isListening ? styles.listening : ''}`}
          onClick={toggleListening}
        >
          {isListening ? '🔴 Stop Listening' : '🎤 Start Listening'}
        </button>

        {isSpeaking && <div className={styles.speakingIndicator}>🔊 Speaking...</div>}
      </div>

      {/* Wake Words Guide */}
      <div className={styles.guide}>
        <div className={styles.guideTitle}>Wake Words:</div>
        <div className={styles.wakeWords}>
          {Object.values(AGENTS).map((agent) => (
            <div key={agent.name} className={styles.wakeWord}>
              <span className={styles.wakeWordText}>"{agent.wakeWords[0]}"</span>
              <span className={styles.wakeWordAgent}>{agent.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

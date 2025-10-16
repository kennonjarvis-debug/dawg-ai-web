## 🎙️ Instance 3: Voice Interface (STT/TTS)

```markdown
# Claude Code Prompt: Voice Input/Output System

## Mission
Implement voice interface with Deepgram STT and ElevenLabs TTS for hands-free DAW control.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 2: Voice Input)
2. Module 6 from comprehensive spec

## Deliverables

### 1. STT Manager (`src/lib/ai/voice/STTManager.ts`)

```typescript
interface STTConfig {
  provider: 'deepgram' | 'browser';
  language: string;
  model: string;  // 'nova-3' for Deepgram
  keywords?: string[];  // Music production terms
}

interface STTManager {
  start(): Promise<void>;
  stop(): Promise<void>;
  onPartial(callback: (text: string) => void): void;
  onFinal(callback: (text: string) => void): void;
  onError(callback: (error: Error) => void): void;
}

class DeepgramSTT implements STTManager {
  private websocket: WebSocket;
  private mediaRecorder: MediaRecorder;
  private stream: MediaStream;

  async start() {
    // 1. Get microphone access
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2. Connect to Deepgram WebSocket
    this.websocket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&keywords=${MUSIC_TERMS.join(':')}`
    );

    // 3. Stream audio chunks
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 16000
    });

    this.mediaRecorder.ondataavailable = (event) => {
      this.websocket.send(event.data);
    };

    this.mediaRecorder.start(250); // Send chunks every 250ms
  }
}

class BrowserSTT implements STTManager {
  private recognition: SpeechRecognition;

  async start() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      // Handle partial and final results
    };

    this.recognition.start();
  }
}
```

### 2. TTS Manager (`src/lib/ai/voice/TTSManager.ts`)

```typescript
interface TTSConfig {
  provider: 'elevenlabs' | 'browser';
  voiceId: string;
  model: string;
}

class ElevenLabsTTS {
  private apiKey: string;
  private voiceId: string;  // Jarvis voice

  async speak(text: string, mood: 'supportive' | 'excited' | 'challenging' | 'chill'): Promise<void> {
    // Map mood to voice settings
    const settings = this.moodToVoiceSettings(mood);

    // Streaming API for low latency
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',  // Lowest latency
        voice_settings: settings
      })
    });

    // Stream audio directly to AudioContext
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(response.body);
    source.connect(audioContext.destination);
  }

  private moodToVoiceSettings(mood: string) {
    return {
      supportive: { stability: 0.7, similarity_boost: 0.8 },
      excited: { stability: 0.5, similarity_boost: 0.9 },
      challenging: { stability: 0.8, similarity_boost: 0.7 },
      chill: { stability: 0.9, similarity_boost: 0.6 }
    }[mood];
  }
}
```

### 3. Voice Controller (`src/lib/ai/voice/VoiceController.ts`)

Main orchestrator:

```typescript
class VoiceController {
  private stt: STTManager;
  private tts: ElevenLabsTTS;
  private jarvis: Jarvis;
  private isListening = false;

  async startListening() {
    this.isListening = true;
    await this.stt.start();

    this.stt.onPartial((text) => {
      emit('transcript:partial', { text });
    });

    this.stt.onFinal(async (text) => {
      emit('transcript:final', { text });

      const response = await this.jarvis.process({
        transcript: text,
        sessionContext: await getSessionContext(),
        userProfile: await getUserProfile()
      });

      // Execute commands
      for (const cmd of response.commands) {
        await dispatch(cmd);
      }

      // Speak response
      await this.tts.speak(response.response, response.mood);

      // Update chat
      emit('jarvis:response', response);
    });
  }

  async stopListening() {
    this.isListening = false;
    await this.stt.stop();
  }
}
```

### 4. Music Production Keywords

```typescript
const MUSIC_PRODUCTION_TERMS = [
  // Instruments
  'kick', 'snare', 'hi-hat', 'clap', '808', 'bass', 'synth', 'pad', 'lead', 'vocals',
  // Effects
  'reverb', 'delay', 'distortion', 'compressor', 'eq', 'limiter', 'chorus', 'phaser',
  // Parameters
  'volume', 'pan', 'pitch', 'tempo', 'bpm', 'attack', 'release', 'decay', 'sustain',
  // Actions
  'record', 'quantize', 'loop', 'bounce', 'export', 'mute', 'solo', 'arm',
  // Genres
  'trap', 'hip-hop', 'house', 'techno', 'lofi', 'ambient', 'drill', 'phonk',
  // Artists (map to styles)
  'drake', 'travis', 'metro', 'pierre', 'kanye',
  // Musical terms
  'bars', 'beats', 'measure', 'chord', 'progression', 'melody', 'harmony'
];
```

## Testing

### Manual Testing Checklist
```
[ ] Speak "load a beat" → Deepgram recognizes correctly
[ ] Speak "808" → Not misheard as "eight oh eight"
[ ] Speak "hi-hat" → Not misheard as "high hat"
[ ] Network disconnect → Falls back to browser STT
[ ] Microphone denied → Shows helpful error
[ ] Jarvis voice sounds natural (not robotic)
[ ] Mood changes are audible (excited vs chill)
```

## Performance Targets
- STT partial latency: <200ms
- STT final latency: <500ms
- LLM response: <1s
- TTS first chunk: <500ms
- **Total loop: <2s** (speech → action → response)

## Git Branch
`voice-interface`

## Success Criteria
- ✅ Deepgram integration working with streaming
- ✅ ElevenLabs TTS with mood-based voices
- ✅ Browser fallback functional
- ✅ 95%+ recognition accuracy for music terms
- ✅ <2s end-to-end voice loop (p95)
- ✅ Graceful error handling for all failure modes
- ✅ User can control DAW entirely by voice

**Start with STT manager, validate with test phrases, then add TTS.**
```

---


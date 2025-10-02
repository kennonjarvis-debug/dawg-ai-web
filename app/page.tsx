'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Map } from 'lucide-react';
import { TransportControls } from '@/src/widgets/TransportControls/TransportControls';
import { TrackList } from '@/src/widgets/TrackList/TrackList';
import { WaveformDisplay } from '@/src/widgets/WaveformDisplay/WaveformDisplay';
import { FileUpload } from '@/src/widgets/FileUpload/FileUpload';
import { ChatPanel } from '@/src/widgets/ChatPanel/ChatPanel';
import { AuthHeader } from '@/src/widgets/AuthHeader/AuthHeader';
import { ProjectSelector } from '@/src/widgets/ProjectSelector/ProjectSelector';
import { CompactPitchMonitor } from '@/src/widgets/CompactPitchMonitor/CompactPitchMonitor';
import { CompactEQControls } from '@/src/widgets/CompactEQControls/CompactEQControls';
import { ProjectStats } from '@/src/widgets/ProjectStats/ProjectStats';
import { QuickActions } from '@/src/widgets/QuickActions/QuickActions';
import { VoiceInterface } from '@/src/voice/VoiceInterface';
import { AudioContextProvider } from '@/src/contexts/AudioContext';
import { initializeTransport } from '@/src/core/transport';
import { useTrackStore } from '@/src/core/store';
import { useRecording } from '@/src/core/useRecording';
import { usePlayback } from '@/src/core/usePlayback';
import { importAudioFiles } from '@/src/utils/audioImport';

export default function Home() {
  const router = useRouter();
  const { addTrack, addRecording, setActiveTrack } = useTrackStore();
  const [showUpload, setShowUpload] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Initialize recording and playback hooks (they handle their own lifecycle)
  useRecording();
  usePlayback();

  useEffect(() => {
    initializeTransport(120);
  }, []);

  const handleAddTrack = () => {
    addTrack('audio');
  };

  const handleUpload = () => {
    setShowUpload(true);
  };

  const handleFilesSelected = async (files: File[]) => {
    setIsImporting(true);

    try {
      const importedAudios = await importAudioFiles(files);

      // Create tracks and add recordings sequentially
      for (let i = 0; i < importedAudios.length; i++) {
        const imported = importedAudios[i];
        const fileName = files[i].name.replace(/\.[^/.]+$/, ''); // Remove extension

        // Add track first
        addTrack('audio');

        // Get the track that was just created
        const tracks = useTrackStore.getState().tracks;
        const newTrack = tracks[tracks.length - 1];

        if (newTrack) {
          // Update track name to match file
          useTrackStore.getState().updateTrack(newTrack.id, { name: fileName });

          // Create recording with waveform data
          const recording = {
            id: `recording-${Date.now()}-${i}`,
            blob: imported.blob,
            duration: imported.duration,
            createdAt: new Date(),
            waveformData: imported.waveformData,
          };

          // Add recording to the new track
          addRecording(newTrack.id, recording);

          // Set this track as active so waveform displays
          setActiveTrack(newTrack.id);
        }

        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setShowUpload(false);
    } catch (error) {
      console.error('Failed to import files:', error);
      alert('Failed to import some files. Check console for details.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AudioContextProvider>
      <div style={{
        height: '100vh',
        background: 'transparent',
        color: 'var(--foreground)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: 'hidden'
      }}>
        {/* Top Bar - Transport & Auth */}
        <div style={{
          display: 'flex',
          gap: '12px',
          zIndex: 100,
          height: '60px',
          flexShrink: 0
        }}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="floating-card"
            style={{
              padding: '10px 16px',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--surface-1)',
              color: 'var(--protools-cyan)',
              fontSize: '18px'
            }}
          >
            ☰
          </button>

          {/* Journey Button */}
          <button
            onClick={() => router.push('/journey')}
            className="floating-card"
            style={{
              padding: '10px 16px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--protools-cyan), var(--protools-purple))',
              color: '#000',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 229, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.3)';
            }}
          >
            <Map size={18} />
            Start Journey
          </button>

          {/* Transport Controls Card */}
          <div className="floating-card" style={{
            flex: 1,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <TransportControls
              onAddTrack={handleAddTrack}
              onUpload={handleUpload}
            />
          </div>

          {/* Auth Header Card */}
          <div className="floating-card" style={{
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <AuthHeader />
          </div>
        </div>

      {/* Main Layout with Sidebar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flex: 1,
        minHeight: 0
      }}>
        {/* Left Sidebar - Collapsible */}
        {showSidebar && (
          <div style={{
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flexShrink: 0
          }}>
            {/* Project Selector */}
            <div className="floating-card" style={{
              padding: '12px'
            }}>
              <ProjectSelector />
            </div>

            {/* AI Coach */}
            <div className="floating-card" style={{
              flex: 1,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '10px',
                color: 'var(--protools-purple)',
                textShadow: '0 0 10px rgba(176, 102, 255, 0.5)'
              }}>
                AI Coach
              </h2>
              <ChatPanel />
            </div>
          </div>
        )}

        {/* Main Content - Tracks + Waveform */}
        <div className="floating-card" style={{
          flex: 1,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          gap: '12px'
        }}>
          {/* Tracks Section */}
          <div style={{
            height: '35%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '10px',
              color: 'var(--protools-cyan)',
              textShadow: '0 0 10px rgba(0, 229, 255, 0.5)'
            }}>
              Tracks
            </h2>
            <TrackList />
          </div>

          {/* Waveform Section */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '10px',
              color: 'var(--protools-blue)',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
            }}>
              Waveform
            </h2>
            <WaveformDisplay />
          </div>
        </div>
      </div>

      {/* Bottom Widget Row - Compact Tools + Voice */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr',
        gap: '12px',
        minHeight: '140px',
        flexShrink: 0
      }}>
        {/* Compact Pitch Monitor */}
        <div className="floating-card" style={{
          padding: '8px 10px',
          overflow: 'hidden'
        }}>
          <CompactPitchMonitor />
        </div>

        {/* Compact EQ */}
        <div className="floating-card" style={{
          padding: '8px 10px',
          overflow: 'hidden'
        }}>
          <CompactEQControls />
        </div>

        {/* Project Stats Compact */}
        <div className="floating-card" style={{
          padding: '8px 10px',
          overflow: 'hidden'
        }}>
          <ProjectStats compact />
        </div>

        {/* Quick Actions */}
        <div className="floating-card" style={{
          padding: '8px 10px',
          overflow: 'hidden'
        }}>
          <QuickActions />
        </div>

        {/* Voice Interface */}
        <div className="floating-card" style={{
          padding: '8px 10px',
          overflow: 'hidden'
        }}>
          <VoiceInterface compact />
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="floating-card" style={{
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--protools-cyan)',
                textShadow: '0 0 10px rgba(0, 229, 255, 0.5)'
              }}>
                Upload Audio Files
              </h2>
              <button
                onClick={() => setShowUpload(false)}
                disabled={isImporting}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'var(--foreground)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>
            </div>

            <FileUpload
              onFilesSelected={handleFilesSelected}
            />

            {isImporting && (
              <div style={{
                marginTop: '24px',
                textAlign: 'center',
                color: 'var(--protools-blue)',
                fontSize: '14px',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
              }}>
                Importing files...
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </AudioContextProvider>
  );
}

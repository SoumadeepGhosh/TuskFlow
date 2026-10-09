/**
 * Enterprise Web Audio Chime Generator
 * Synthesizes a clean, pleasant notification sound using Web Audio API.
 * Zero external audio file dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function playNotificationSound(volume = 0.5): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(Math.min(Math.max(volume, 0), 1) * 0.3, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    gainNode.connect(ctx.destination);

    // First harmonic tone: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second harmonic tone: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);
    osc2.connect(gainNode);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  } catch {
    // Audio playback error or autoplay restrictions - silent fallback
  }
}


/**
 * Web Audio API Sound Synthesizer for TaskPulse Alarm Channels
 * Generates rich synthetic audio alerts with zero external audio assets
 */

import { SoundProfile } from '../types/index';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  play(profile: SoundProfile) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (profile) {
        case 'chime':
          // Upward arpeggio: C5, E5, G5, C6
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);

            gain.gain.setValueAtTime(0, now + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.5);
          });
          break;

        case 'alert_beacon':
          // Urgent dual-tone beacon ping
          [880, 1174.66, 880, 1174.66].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);

            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.3);
          });
          break;

        case 'zen_bell':
          // Resonant deep singing bowl tone
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainZen = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(329.63, now); // E4
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(659.25, now); // E5

          gainZen.gain.setValueAtTime(0.35, now);
          gainZen.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

          osc1.connect(gainZen);
          osc2.connect(gainZen);
          gainZen.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 2.5);
          osc2.stop(now + 2.5);
          break;

        case 'soft_pulse':
          // Warm harmonic pulse
          [440, 554.37].forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.85);
          });
          break;
      }
    } catch (e) {
      console.warn('Audio synthesis suspended or unavailable', e);
    }
  }
}

export const soundService = new SoundSynthesizer();

/**
 * Native Web Audio API Procedural Sci-Fi Sound FX Engine
 * Zero external MP3/WAV dependencies — runs 100% offline with zero latency.
 */

class SoundEffectsEngine {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        // Load mute preference from localStorage
        try {
            const saved = localStorage.getItem('twin_sfx_muted');
            if (saved !== null) {
                this.isMuted = saved === 'true';
            }
        } catch {
            this.isMuted = false;
        }
    }

    private initContext(): AudioContext | null {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem('twin_sfx_muted', String(this.isMuted));
        } catch {}
        if (!this.isMuted) {
            this.playCyberBeep(880, 0.08);
        }
        return this.isMuted;
    }

    public getMuted(): boolean {
        return this.isMuted;
    }

    /**
     * Futuristic UI Click / Chirp
     */
    public playCyberBeep(freq = 900, duration = 0.06, type: OscillatorType = 'sine') {
        if (this.isMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {}
    }

    /**
     * Organ Lock-On Target Tone
     */
    public playOrganLock() {
        if (this.isMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            [1200, 1600].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);

                gain.gain.setValueAtTime(0.07, now + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.08);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.08);
            });
        } catch {}
    }

    /**
     * Holographic Scanner Laser Sweep
     */
    public playLaserSweep() {
        if (this.isMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, now);
            filter.Q.setValueAtTime(4, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.8);
        } catch {}
    }

    /**
     * High Toxicity / Pathology Alert Pulse
     */
    public playWarningPulse() {
        if (this.isMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(370, now + 0.1);

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch {}
    }
}

export const sfx = new SoundEffectsEngine();

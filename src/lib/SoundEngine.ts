/**
 * SoundEngine.ts
 * ─────────────────────────────────────────────────────────────────
 * Spatial ambient audio engine using Web Audio API only.
 * Zero external dependencies. Zero audio files needed.
 * All sound is synthesized in real-time.
 *
 * Architecture:
 * ┌─ AudioContext (singleton)
 * ├─ MasterGain → DynamicsCompressor → destination
 * ├─ AmbientLayer    slow breathing drone (mode-specific)
 * ├─ HarmonicLayer   warm overtone shimmer
 * ├─ SpatialPanner   cursor position → stereo field
 * └─ EventBus        hover/click/scroll/mode sounds
 *
 * Design philosophy:
 * Every sound is a sine-based or noise-based synthesis.
 * Nothing is percussive or jarring.
 * Everything breathes, resonates, dissolves.
 */

// ─── Types ────────────────────────────────────────────────────────
type Mode = "normal" | "ramadan";

interface SoundEngineState {
    ctx: AudioContext | null;
    master: GainNode | null;
    ambientOsc: OscillatorNode[];
    ambientGains: GainNode[];
    harmonicOsc: OscillatorNode[];
    harmonicGains: GainNode[];
    panner: StereoPannerNode | null;
    mode: Mode;
    muted: boolean;
    initialized: boolean;
}

// ─── Frequency sets ───────────────────────────────────────────────
// Normal mode: cool space frequencies (A minor pentatonic, low)
const SPACE_FREQS = [55, 82.4, 110, 164.8, 220];       // A1, E2, A2, E3, A3
const SPACE_HARMONICS = [330, 440, 550, 660];           // Overtones

// Ramadan mode: warm maqam Rast frequencies (C-D-Eb-F-G-Ab-Bb-C)
// Root at 130.8Hz (C3), tuned to maqam feel
const RAST_FREQS = [65.4, 98.0, 130.8, 174.6, 196.0];  // C2, G2, C3, F3, G3
const RAST_HARMONICS = [261.6, 349.2, 392.0, 523.2];   // C4, F4, G4, C5

// ─── Singleton state ──────────────────────────────────────────────
const state: SoundEngineState = {
    ctx: null,
    master: null,
    ambientOsc: [],
    ambientGains: [],
    harmonicOsc: [],
    harmonicGains: [],
    panner: null,
    mode: "normal",
    muted: false,
    initialized: false,
};

// ─── Core: create AudioContext ────────────────────────────────────
const getCtx = (): AudioContext => {
    if (!state.ctx) {
        state.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (state.ctx.state === "suspended") {
        state.ctx.resume();
    }
    return state.ctx;
};

// ─── Smooth ramp utility ──────────────────────────────────────────
const ramp = (param: AudioParam, value: number, duration: number) => {
    const ctx = getCtx();
    param.cancelScheduledValues(ctx.currentTime);
    param.setValueAtTime(param.value, ctx.currentTime);
    param.linearRampToValueAtTime(value, ctx.currentTime + duration);
};

const expRamp = (param: AudioParam, value: number, duration: number) => {
    const ctx = getCtx();
    param.cancelScheduledValues(ctx.currentTime);
    param.setValueAtTime(Math.max(param.value, 0.0001), ctx.currentTime);
    param.exponentialRampToValueAtTime(Math.max(value, 0.0001), ctx.currentTime + duration);
};

// ─── Build noise buffer (for breath/whisper effects) ─────────────
const makeNoiseBuffer = (ctx: AudioContext, duration: number): AudioBuffer => {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * duration, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1);
    }
    return buf;
};

// ─── Initialize ambient layers ────────────────────────────────────
const initAmbient = (mode: Mode) => {
    const ctx = getCtx();
    if (!state.master) return;

    // Tear down existing oscillators gracefully
    state.ambientOsc.forEach((o, i) => {
        try {
            ramp(state.ambientGains[i].gain, 0, 1.5);
            setTimeout(() => { try { o.stop(); } catch { } }, 1600);
        } catch { }
    });
    state.harmonicOsc.forEach((o, i) => {
        try {
            ramp(state.harmonicGains[i].gain, 0, 1.2);
            setTimeout(() => { try { o.stop(); } catch { } }, 1300);
        } catch { }
    });

    state.ambientOsc = [];
    state.ambientGains = [];
    state.harmonicOsc = [];
    state.harmonicGains = [];

    const freqs = mode === "ramadan" ? RAST_FREQS : SPACE_FREQS;
    const harmFreqs = mode === "ramadan" ? RAST_HARMONICS : SPACE_HARMONICS;

    // Master volume (mode-specific)
    const masterVol = mode === "ramadan" ? 0.042 : 0.028;

    // ── Ambient drones (sine + slight detune for warmth) ──────────
    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filt = ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // Slight detune for organic warmth (in cents)
        osc.detune.setValueAtTime((i % 3 - 1) * 4, ctx.currentTime);

        // Breathing LFO on gain
        const lfo = ctx.createOscillator();
        const lfg = ctx.createGain();
        lfo.frequency.setValueAtTime(.08 + i * .015, ctx.currentTime);
        lfg.gain.setValueAtTime(0.18, ctx.currentTime);
        lfo.connect(lfg);
        lfg.connect(gain.gain);
        lfo.start();

        filt.type = "lowpass";
        filt.frequency.value = 600;
        filt.Q.value = 0.7;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        const targetVol = masterVol * (1 - i * 0.14);
        setTimeout(() => {
            ramp(gain.gain, targetVol, 2.5 + i * 0.3);
        }, 200 + i * 150);

        osc.connect(filt);
        filt.connect(gain);
        gain.connect(state.master!);

        osc.start();
        state.ambientOsc.push(osc);
        state.ambientGains.push(gain);
    });

    // ── Harmonic shimmer (higher, softer) ─────────────────────────
    harmFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - .5) * 8, ctx.currentTime);

        // Slow shimmer LFO
        const lfo = ctx.createOscillator();
        const lfg = ctx.createGain();
        lfo.frequency.setValueAtTime(.04 + i * .02, ctx.currentTime);
        lfg.gain.setValueAtTime(0.008, ctx.currentTime);
        lfo.connect(lfg);
        lfg.connect(gain.gain);
        lfo.start();

        gain.gain.setValueAtTime(0, ctx.currentTime);
        setTimeout(() => {
            ramp(gain.gain, 0.006 + (mode === "ramadan" ? 0.003 : 0), 3 + i * .4);
        }, 800 + i * 200);

        osc.connect(gain);
        gain.connect(state.master!);
        osc.start();

        state.harmonicOsc.push(osc);
        state.harmonicGains.push(gain);
    });
};

// ─── PUBLIC API ───────────────────────────────────────────────────

/**
 * Initialize the sound engine.
 * Must be called from a user gesture (click/keydown).
 */
export const initSound = (mode: Mode = "normal") => {
    if (state.initialized) return;
    try {
        const ctx = getCtx();

        // Master chain: gain → compressor → output
        const master = ctx.createGain();
        const compressor = ctx.createDynamicsCompressor();
        const panner = ctx.createStereoPanner();

        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        master.gain.setValueAtTime(0.85, ctx.currentTime);
        panner.pan.setValueAtTime(0, ctx.currentTime);

        master.connect(compressor);
        compressor.connect(panner);
        panner.connect(ctx.destination);

        state.master = master;
        state.panner = panner;
        state.mode = mode;
        state.initialized = true;

        initAmbient(mode);
    } catch (e) {
        console.warn("SoundEngine: init failed", e);
    }
};

/**
 * Switch between normal and Ramadan ambient soundscapes.
 * Crossfades over ~3 seconds.
 */
export const setMode = (mode: Mode) => {
    if (!state.initialized || state.mode === mode) return;
    state.mode = mode;

    // Play mode-switch chime before rebuilding ambient
    playModeSwitch(mode);

    setTimeout(() => {
        initAmbient(mode);
    }, 400);
};

/**
 * Update stereo panning from cursor X position (0-1 normalized).
 * Very subtle — just 15% pan range so it doesn't distract.
 */
export const updateCursorPan = (normalizedX: number) => {
    if (!state.panner || !state.initialized) return;
    const pan = (normalizedX - 0.5) * 0.15;
    ramp(state.panner.pan, pan, 0.3);
};

/**
 * Hover sound — soft sine blip, pitch varies by element type.
 * 'card' = warm low tone, 'button' = higher crisp tone
 */
export const playHover = (type: "card" | "button" | "subject" = "card") => {
    if (!state.initialized || state.muted) return;
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filt = ctx.createBiquadFilter();

        const pitchMap = {
            card: state.mode === "ramadan" ? 392 : 440,   // G4 / A4
            button: state.mode === "ramadan" ? 523 : 587,   // C5 / D5
            subject: state.mode === "ramadan" ? 349 : 330,   // F4 / E4
        };

        osc.type = "sine";
        osc.frequency.setValueAtTime(pitchMap[type], ctx.currentTime);
        // Slight pitch envelope: slight rise then fall
        osc.frequency.linearRampToValueAtTime(pitchMap[type] * 1.015, ctx.currentTime + 0.04);
        osc.frequency.linearRampToValueAtTime(pitchMap[type] * 0.99, ctx.currentTime + 0.12);

        filt.type = "bandpass";
        filt.frequency.value = pitchMap[type];
        filt.Q.value = 3;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.028, ctx.currentTime + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

        osc.connect(filt);
        filt.connect(gain);
        gain.connect(state.master ?? ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
    } catch { }
};

/**
 * Click sound — resonant pluck feel.
 * Ramadan: soft bell-like. Normal: sharp sine pop.
 */
export const playClick = (x?: number, y?: number) => {
    if (!state.initialized || state.muted) return;
    try {
        const ctx = getCtx();

        if (state.mode === "ramadan") {
            // Bell-like: multiple harmonic sines decaying at different rates
            [1, 2, 3, 4].forEach((harmonic, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const baseF = 523.25; // C5
                osc.type = "sine";
                osc.frequency.setValueAtTime(baseF * harmonic * 0.5, ctx.currentTime);
                // Each harmonic decays faster
                const vol = 0.055 / harmonic;
                const dur = 1.2 / harmonic;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
                osc.connect(gain);
                gain.connect(state.master ?? ctx.destination);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + dur + 0.05);
            });
        } else {
            // Space pop: sharp filtered click
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filt = ctx.createBiquadFilter();

            osc.type = "sine";
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);

            filt.type = "bandpass";
            filt.frequency.value = 440;
            filt.Q.value = 2;

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

            osc.connect(filt);
            filt.connect(gain);
            gain.connect(state.master ?? ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        }
    } catch { }
};

/**
 * Mode switch chime — plays when toggling Ramadan mode.
 * Normal→Ramadan: ascending maqam fragment.
 * Ramadan→Normal: descending cool arpeggio.
 */
export const playModeSwitch = (newMode: Mode) => {
    if (!state.initialized || state.muted) return;
    try {
        const ctx = getCtx();

        if (newMode === "ramadan") {
            // Ascending warm arpeggio: C-E-G-C (maqam-flavoured)
            const notes = [261.6, 311.1, 392.0, 523.2];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const rev = ctx.createConvolver();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                // Slight vibrato for maqam feel
                const vib = ctx.createOscillator();
                const vbg = ctx.createGain();
                vib.frequency.setValueAtTime(5.5, ctx.currentTime);
                vbg.gain.setValueAtTime(3, ctx.currentTime);
                vib.connect(vbg);
                vbg.connect(osc.frequency);
                vib.start(ctx.currentTime + i * 0.12);
                vib.stop(ctx.currentTime + i * 0.12 + 0.6);

                const startT = ctx.currentTime + i * 0.12;
                gain.gain.setValueAtTime(0, startT);
                gain.gain.linearRampToValueAtTime(0.05, startT + 0.025);
                gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.8);

                osc.connect(gain);
                gain.connect(state.master ?? ctx.destination);
                osc.start(startT);
                osc.stop(startT + 0.85);
            });
        } else {
            // Descending cool arpeggio: A-E-C#-A
            const notes = [440, 329.6, 277.2, 220];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                const startT = ctx.currentTime + i * 0.1;
                gain.gain.setValueAtTime(0, startT);
                gain.gain.linearRampToValueAtTime(0.04, startT + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.55);

                osc.connect(gain);
                gain.connect(state.master ?? ctx.destination);
                osc.start(startT);
                osc.stop(startT + 0.6);
            });
        }
    } catch { }
};

/**
 * Scroll whisper — very subtle, pitch tracks scroll velocity.
 */
export const playScrollWhisper = (velocity: number) => {
    if (!state.initialized || state.muted || Math.abs(velocity) < 8) return;
    try {
        const ctx = getCtx();
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        const filt = ctx.createBiquadFilter();

        src.buffer = makeNoiseBuffer(ctx, 0.15);
        src.loop = false;

        filt.type = "bandpass";
        filt.frequency.value = 800 + Math.abs(velocity) * 12;
        filt.Q.value = 8;

        const vol = Math.min(Math.abs(velocity) * 0.00018, 0.012);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

        src.connect(filt);
        filt.connect(gain);
        gain.connect(state.master ?? ctx.destination);
        src.start();
    } catch { }
};

/**
 * Navigation whoosh — played on route change.
 */
export const playNavigate = () => {
    if (!state.initialized || state.muted) return;
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filt = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(state.mode === "ramadan" ? 392 : 440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
            state.mode === "ramadan" ? 196 : 220,
            ctx.currentTime + 0.35
        );

        filt.type = "lowpass";
        filt.frequency.value = 1200;
        filt.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

        osc.connect(filt);
        filt.connect(gain);
        gain.connect(state.master ?? ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
    } catch { }
};

/**
 * Toggle mute. Returns new muted state.
 */
export const toggleMute = (): boolean => {
    if (!state.master) return state.muted;
    state.muted = !state.muted;
    ramp(state.master.gain, state.muted ? 0 : 0.85, 0.4);
    return state.muted;
};

/**
 * Get current muted state.
 */
export const isMuted = () => state.muted;

/**
 * Suspend audio (page hidden / tab switch).
 */
export const suspend = () => state.ctx?.suspend();

/**
 * Resume audio.
 */
export const resumeAudio = () => state.ctx?.resume();
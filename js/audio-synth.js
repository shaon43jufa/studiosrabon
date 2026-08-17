/* ==========================================================================
   STUDIO SRABON — MULTI-TRACK PROCEDURAL AUDIO SYNTHESIZER ENGINE
   Cycles automatically through 5 distinct cinematic soundscapes on each toggle.
   ========================================================================== */

// ============================================================================
// GLOBAL AUDIO SETTINGS — Adjust Master Volume anytime (1 to 100)
// ============================================================================
const MASTER_VOLUME_PERCENT = 100; // Scale 1 to 100 (Default: 80 = +60% boost)

class AtmosphereSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayFilter = null;
    this.filter = null;
    this.timerId = null;

    this.currentTrackIndex = 0;
    this.step = 0;
    this.nextNoteTime = 0;

    // 5 Unique Soundscapes
    this.tracks = [
      // -------------------------------------------------------------
      // Track 0: Cinematic Ambient Arp (84 BPM)
      // -------------------------------------------------------------
      {
        id: 0,
        title: "Cinematic Ambient Arp",
        bpm: 84,
        filterCutoff: 750,
        delayTime: 0.35,
        delayFeedbackVal: 0.28,
        padType: "sine",
        bassType: "sine",
        leadType: "sine",
        chords: [
          { name: "Cm9", bass: 65.41, pad: [130.81, 155.56, 196.00, 293.66], melody: [261.63, 311.13, 392.00, 523.25, 587.33, 392.00, 311.13, 261.63] },
          { name: "Abmaj7", bass: 51.91, pad: [103.83, 130.81, 155.56, 207.65], melody: [207.65, 261.63, 311.13, 415.30, 523.25, 415.30, 311.13, 261.63] },
          { name: "Ebmaj9", bass: 77.78, pad: [155.56, 196.00, 233.08, 293.66], melody: [311.13, 392.00, 466.16, 587.33, 622.25, 587.33, 466.16, 392.00] },
          { name: "Bb/Gm", bass: 58.27, pad: [116.54, 146.83, 174.61, 220.00], melody: [233.08, 293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 293.66] }
        ],
        melodyPattern: [1, 0, 1, 0,  1, 1, 0, 1,  1, 0, 1, 0,  1, 0, 1, 1],
        bassPattern:   [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0]
      },

      // -------------------------------------------------------------
      // Track 1: Neon Cyberpunk Pulse (108 BPM)
      // -------------------------------------------------------------
      {
        id: 1,
        title: "Neon Cyberpunk Pulse",
        bpm: 108,
        filterCutoff: 850,
        delayTime: 0.28,
        delayFeedbackVal: 0.32,
        padType: "triangle",
        bassType: "sawtooth",
        leadType: "square",
        chords: [
          { name: "Dm", bass: 73.42, pad: [146.83, 174.61, 220.00, 293.66], melody: [293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 220.00] },
          { name: "F", bass: 87.31, pad: [174.61, 220.00, 261.63, 349.23], melody: [349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 261.63] },
          { name: "C", bass: 65.41, pad: [130.81, 164.81, 196.00, 261.63], melody: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00] },
          { name: "Gm", bass: 98.00, pad: [196.00, 233.08, 293.66, 392.00], melody: [392.00, 466.16, 587.33, 783.99, 587.33, 466.16, 392.00, 293.66] }
        ],
        melodyPattern: [1, 0, 0, 1,  0, 1, 0, 0,  1, 0, 1, 0,  0, 1, 0, 1],
        bassPattern:   [1, 0, 1, 1,  0, 1, 1, 0,  1, 0, 1, 1,  0, 1, 1, 0]
      },

      // -------------------------------------------------------------
      // Track 2: Ethereal Lo-Fi Chill (72 BPM)
      // -------------------------------------------------------------
      {
        id: 2,
        title: "Ethereal Lo-Fi Chill",
        bpm: 72,
        filterCutoff: 620,
        delayTime: 0.42,
        delayFeedbackVal: 0.35,
        padType: "sine",
        bassType: "sine",
        leadType: "sine",
        chords: [
          { name: "Fmaj7", bass: 43.65, pad: [174.61, 220.00, 261.63, 329.63], melody: [349.23, 440.00, 523.25, 659.25] },
          { name: "Em7", bass: 41.20, pad: [164.81, 196.00, 246.94, 293.66], melody: [329.63, 392.00, 493.88, 587.33] },
          { name: "Dm9", bass: 36.71, pad: [146.83, 174.61, 220.00, 293.66], melody: [293.66, 349.23, 440.00, 587.33] },
          { name: "Cmaj9", bass: 32.70, pad: [130.81, 164.81, 196.00, 246.94], melody: [261.63, 329.63, 392.00, 493.88] }
        ],
        melodyPattern: [1, 0, 0, 1,  0, 0, 1, 0,  0, 1, 0, 0,  1, 0, 0, 1],
        bassPattern:   [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0]
      },

      // -------------------------------------------------------------
      // Track 3: Deep Space Shimmer (60 BPM)
      // -------------------------------------------------------------
      {
        id: 3,
        title: "Deep Space Shimmer",
        bpm: 60,
        filterCutoff: 950,
        delayTime: 0.50,
        delayFeedbackVal: 0.42,
        padType: "sine",
        bassType: "sine",
        leadType: "sine",
        chords: [
          { name: "Am9", bass: 55.00, pad: [110.00, 164.81, 220.00, 261.63, 329.63], melody: [440.00, 523.25, 659.25, 880.00, 987.77, 659.25, 523.25, 440.00] },
          { name: "Fmaj7", bass: 43.65, pad: [87.31, 130.81, 174.61, 220.00, 261.63], melody: [349.23, 440.00, 523.25, 659.25, 698.46, 523.25, 440.00, 349.23] },
          { name: "Dm7", bass: 36.71, pad: [73.42, 110.00, 146.83, 174.61, 220.00], melody: [293.66, 349.23, 440.00, 523.25, 587.33, 440.00, 349.23, 293.66] },
          { name: "Em7", bass: 41.20, pad: [82.41, 123.47, 164.81, 196.00, 246.94], melody: [329.63, 392.00, 493.88, 587.33, 659.25, 493.88, 392.00, 329.63] }
        ],
        melodyPattern: [1, 0, 1, 0,  0, 1, 0, 1,  1, 0, 0, 1,  0, 1, 1, 0],
        bassPattern:   [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0]
      },

      // -------------------------------------------------------------
      // Track 4: Cinematic Trailer Hybrid (90 BPM)
      // -------------------------------------------------------------
      {
        id: 4,
        title: "Cinematic Trailer Hybrid",
        bpm: 90,
        filterCutoff: 800,
        delayTime: 0.33,
        delayFeedbackVal: 0.30,
        padType: "triangle",
        bassType: "sawtooth",
        leadType: "triangle",
        chords: [
          { name: "Gm", bass: 49.00, pad: [196.00, 233.08, 293.66, 392.00], melody: [392.00, 466.16, 587.33, 783.99] },
          { name: "Eb", bass: 38.89, pad: [155.56, 196.00, 233.08, 311.13], melody: [311.13, 392.00, 466.16, 622.25] },
          { name: "Bb", bass: 58.27, pad: [233.08, 293.66, 349.23, 466.16], melody: [466.16, 587.33, 698.46, 932.33] },
          { name: "F", bass: 43.65, pad: [174.61, 220.00, 261.63, 349.23], melody: [349.23, 440.00, 523.25, 698.46] }
        ],
        melodyPattern: [1, 1, 0, 1,  1, 0, 1, 1,  1, 1, 0, 1,  1, 0, 1, 0],
        bassPattern:   [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0]
      }
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.1, this.ctx.currentTime);

    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.30, this.ctx.currentTime);

    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = "lowpass";
    this.delayFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.masterGain);

    this.masterGain.connect(this.filter);
    this.filter.connect(this.ctx.destination);
  }

  toggle() {
    if (!this.ctx) this.init();

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
      // Rotate to next track for next turn-on
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    } else {
      this.start();
    }

    return this.isPlaying;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;

    const track = this.tracks[this.currentTrackIndex];
    console.log(`%c[Studio Srabon Audio] Playing Track ${track.id + 1}/5: ${track.title} (${track.bpm} BPM)`, "color: #ffb703; font-weight: bold;");

    // Configure track acoustics
    this.filter.frequency.setValueAtTime(track.filterCutoff, this.ctx.currentTime);
    this.delayNode.delayTime.setValueAtTime(track.delayTime, this.ctx.currentTime);
    this.delayFeedback.gain.setValueAtTime(track.delayFeedbackVal, this.ctx.currentTime);

    // Calculate volume scale from top-level setting (1 to 100)
    const volPercent = (typeof MASTER_VOLUME_PERCENT === "number") ? Math.min(100, Math.max(1, MASTER_VOLUME_PERCENT)) : 80;
    const targetGain = 0.28 * (volPercent / 100.0);

    // Smooth fade in
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 2.0);

    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduler();
  }

  scheduler() {
    if (!this.isPlaying) return;
    const track = this.tracks[this.currentTrackIndex];

    while (this.nextNoteTime < this.ctx.currentTime + 0.15) {
      this.scheduleStep(this.step, this.nextNoteTime, track);
      this.advanceStep(track);
    }

    this.timerId = setTimeout(() => this.scheduler(), 25);
  }

  advanceStep(track) {
    const secondsPer16th = (60.0 / track.bpm) / 4.0;
    this.nextNoteTime += secondsPer16th;
    this.step = (this.step + 1) % 64;
  }

  scheduleStep(step, time, track) {
    const chordIndex = Math.floor(step / 16);
    const chord = track.chords[chordIndex];
    const stepInChord = step % 16;
    const step16th = (60.0 / track.bpm) / 4.0;
    const chordDuration = 16 * step16th;

    // 1. Pad chord
    if (stepInChord === 0) {
      this.playPad(chord, time, chordDuration, track.padType);
    }

    // 2. Bass note
    if (track.bassPattern[stepInChord] === 1) {
      const bassDuration = (track.id === 1) ? step16th * 0.85 : chordDuration;
      this.playBass(chord.bass, time, bassDuration, track.bassType);
    }

    // 3. Melody / Arp pluck
    if (track.melodyPattern[stepInChord] === 1) {
      const note = chord.melody[stepInChord % chord.melody.length];
      this.playLead(note, time, track.leadType);
    }
  }

  playBass(freq, time, duration, type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, time);

    if (type === "sawtooth") {
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, time);
      filter.frequency.exponentialRampToValueAtTime(130, time + duration);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.065, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
    } else {
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.3);
      gain.gain.setValueAtTime(0.08, time + duration - 0.5);
      gain.gain.linearRampToValueAtTime(0.001, time + duration);
      osc.connect(gain);
    }

    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration);
  }

  playPad(chord, time, duration, type) {
    if (!this.ctx) return;

    chord.pad.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.032, time + 0.8);
      gain.gain.setValueAtTime(0.032, time + duration - 0.8);
      gain.gain.linearRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  playLead(freq, time, type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
    }
  }
}

window.atmosphereSynth = new AtmosphereSynth();

/* ==========================================================================
   STUDIO SRABON — WEB AUDIO SYNTHESIZER
   Generates a rich, atmospheric ambient sci-fi soundscape without external files.
   ========================================================================== */

class AtmosphereSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);

    // Lowpass filter for warm atmospheric sound
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    this.masterGain.connect(this.filter);
    this.filter.connect(this.ctx.destination);
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }

    return this.isPlaying;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Smoothly fade in master volume
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 3);

    // Harmonious chord notes for ambient sci-fi vibe (C minor / Eb / G / Bb)
    const baseFreqs = [65.41, 130.81, 155.56, 196.00, 293.66]; // C2, C3, Eb3, G3, D4

    this.oscillators = baseFreqs.map((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Alternate between sine and triangle waveforms
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for lush chorus effect
      osc.detune.setValueAtTime((Math.random() - 0.5) * 12, this.ctx.currentTime);

      // LFO for slow ambient volume pulsing
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      lfo.connect(lfoGain.gain);
      lfo.start();

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      return { osc, lfo };
    });
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    // Smoothly fade out
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    setTimeout(() => {
      if (!this.isPlaying) {
        this.oscillators.forEach(item => {
          try {
            item.osc.stop();
            item.lfo.stop();
          } catch(e) {}
        });
        this.oscillators = [];
      }
    }, 1600);
  }
}

window.atmosphereSynth = new AtmosphereSynth();

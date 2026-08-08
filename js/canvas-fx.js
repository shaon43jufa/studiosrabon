/* ==========================================================================
   STUDIO SRABON — DAVINCI COLOR SCOPE CANVAS SYSTEM
   Interactive vectorscope particle mesh, RGB parade sparks & preloader visuals.
   ========================================================================== */

// Helper to resolve CSS variables from the design system in style.css
function getCssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

class BackgroundCanvasEngine {
  constructor() {
    this.canvas = document.getElementById("hero-bg-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.particles = [];
    this.numParticles = 60;
    this.mouse = { x: null, y: null, radius: 200 };
    this.animId = null;
    this.isDesktop = false;
    this.onMouseMoveBound = (e) => this.onMouseMove(e);

    this.init();
  }

  init() {
    this.updatePalette();
    this.checkBreakpoint();
    window.addEventListener("resize", () => this.checkBreakpoint());
  }

  updatePalette() {
    this.palette = [
      getCssVar("--scope-cyan", "#00f2fe"),
      getCssVar("--scope-magenta", "#ff2a8d"),
      getCssVar("--scope-green", "#00ff87"),
      getCssVar("--scope-amber", "#ffb703")
    ];
  }

  checkBreakpoint() {
    const isDesktop = window.innerWidth > 1024;

    if (isDesktop) {
      if (!this.isDesktop) {
        this.isDesktop = true;
        this.resize();
        window.addEventListener("mousemove", this.onMouseMoveBound);
        this.createParticles();
        if (!this.animId) {
          this.animate();
        }
      } else {
        this.resize();
      }
    } else {
      // Mobile / Tablet: Render particles statically (paused frame), disable 60fps animation loop & mouse listener
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.isDesktop = false;
      window.removeEventListener("mousemove", this.onMouseMoveBound);
      this.mouse.x = null;
      this.mouse.y = null;

      this.resize();
      this.createParticles();
      this.drawSingleFrame();
    }
  }

  onMouseMove(e) {
    if (!this.isDesktop) return;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = this.canvas.width = Math.floor(rect.width || window.innerWidth);
    this.height = this.canvas.height = Math.floor(rect.height || window.innerHeight);
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2.2 + 1,
        color: this.palette[Math.floor(Math.random() * this.palette.length)],
        alpha: Math.random() * 0.45 + 0.25
      });
    }
  }

  drawSingleFrame() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const lineStroke = getCssVar("--scope-cyan", "#00f2fe");

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();

      // Connect nearby particles with vector scope grid lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = "rgba(0, 242, 254, " + (0.16 - dist / 140 * 0.16) + ")";
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    if (!this.isDesktop || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Mouse repulsion & glowing vectorscope interaction
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius && dist > 0) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= (dx / dist) * force * 2.5;
          p.y -= (dy / dist) * force * 2.5;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();

      // Connect nearby particles with vector scope grid lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = "rgba(0, 242, 254, " + (0.16 - dist / 140 * 0.16) + ")";
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }
}

// Preloader DaVinci Vectorscope Ring Animation
class PreloaderCanvasEngine {
  constructor() {
    this.canvas = document.getElementById("preloader-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.angle = 0;
    this.animId = null;
    this.isDesktop = false;

    this.init();
  }

  init() {
    this.checkBreakpoint();
    window.addEventListener("resize", () => this.checkBreakpoint());
  }

  checkBreakpoint() {
    const isDesktop = window.innerWidth > 1024;

    if (isDesktop) {
      if (!this.isDesktop) {
        this.isDesktop = true;
        this.resize();
        if (!this.animId) {
          this.animate();
        }
      } else {
        this.resize();
      }
    } else {
      // Mobile / Tablet: Render preloader reticle rings ONCE statically (paused frame)
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.isDesktop = false;
      this.resize();
      this.drawSingleFrame();
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    // Match pixel resolution 1:1 with CSS rendering bounds to prevent aspect ratio distortion
    this.width = this.canvas.width = Math.floor(rect.width || window.innerWidth);
    this.height = this.canvas.height = Math.floor(rect.height || window.innerHeight);
  }

  drawSingleFrame() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.2;
    const radius = Math.min(Math.max(baseRadius, 70), 130);

    const colorCyan = getCssVar("--scope-cyan", "#00f2fe");
    const colorMagenta = getCssVar("--scope-magenta", "#ff2a8d");
    const colorGreen = getCssVar("--scope-green", "#00ff87");

    // Glowing vectorscope reticle (static frame)
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle);

    // Cyan Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
    this.ctx.strokeStyle = colorCyan;
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = colorCyan;
    this.ctx.stroke();

    // Magenta Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius + 18, Math.PI * 0.5, Math.PI * 1.8);
    this.ctx.strokeStyle = colorMagenta;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = colorMagenta;
    this.ctx.stroke();

    // Green Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, Math.max(10, radius - 20), Math.PI * 1.1, Math.PI * 2.2);
    this.ctx.strokeStyle = colorGreen;
    this.ctx.lineWidth = 1.2;
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = colorGreen;
    this.ctx.stroke();

    this.ctx.restore();
  }

  animate() {
    if (!this.isDesktop || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.2;
    const radius = Math.min(Math.max(baseRadius, 80), 130);

    const colorCyan = getCssVar("--scope-cyan", "#00f2fe");
    const colorMagenta = getCssVar("--scope-magenta", "#ff2a8d");
    const colorGreen = getCssVar("--scope-green", "#00ff87");

    this.angle += 0.025;

    // Glowing rotating vectorscope reticle
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle);

    // Cyan Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
    this.ctx.strokeStyle = colorCyan;
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = colorCyan;
    this.ctx.stroke();

    // Magenta Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius + 18, Math.PI * 0.5, Math.PI * 1.8);
    this.ctx.strokeStyle = colorMagenta;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = colorMagenta;
    this.ctx.stroke();

    // Green Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, Math.max(10, radius - 20), Math.PI * 1.1, Math.PI * 2.2);
    this.ctx.strokeStyle = colorGreen;
    this.ctx.lineWidth = 1.2;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = colorGreen;
    this.ctx.stroke();

    this.ctx.restore();

    this.animId = requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BackgroundCanvasEngine();
  new PreloaderCanvasEngine();
});

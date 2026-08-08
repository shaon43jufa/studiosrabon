/* ==========================================================================
   STUDIO SRABON — DAVINCI COLOR SCOPE CANVAS SYSTEM
   Interactive vectorscope particle mesh, RGB parade sparks & preloader visuals.
   ========================================================================== */

class BackgroundCanvasEngine {
  constructor() {
    this.canvas = document.getElementById("hero-bg-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.particles = [];
    this.numParticles = 65;
    this.mouse = { x: null, y: null, radius: 200 };
    this.palette = ["#00f2fe", "#ff2a8d", "#00ff87", "#ffb703"];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
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

  animate() {
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

        if (dist < this.mouse.radius) {
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

    requestAnimationFrame(() => this.animate());
  }
}

// Preloader DaVinci Vectorscope Ring Animation
class PreloaderCanvasEngine {
  constructor() {
    this.canvas = document.getElementById("preloader-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.angle = 0;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  animate() {
    if (!this.canvas) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = 125;

    this.angle += 0.025;

    // Glowing rotating vectorscope reticle
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle);

    // Cyan Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
    this.ctx.strokeStyle = "#00f2fe";
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "#00f2fe";
    this.ctx.stroke();

    // Magenta Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius + 18, Math.PI * 0.5, Math.PI * 1.8);
    this.ctx.strokeStyle = "#ff2a8d";
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#ff2a8d";
    this.ctx.stroke();

    // Green Scope Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius - 20, Math.PI * 1.1, Math.PI * 2.2);
    this.ctx.strokeStyle = "#00ff87";
    this.ctx.lineWidth = 1.2;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#00ff87";
    this.ctx.stroke();

    this.ctx.restore();

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BackgroundCanvasEngine();
  new PreloaderCanvasEngine();
});

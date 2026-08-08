/* ==========================================================================
   STUDIO SRABON — NASIR UDDIN SHAON (studiosrabon.com)
   Core Site Interactivity & Application Logic (v2.5 Real-Time 60FPS VFX Revealer)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initAudioToggle();
  initMobileDrawer();
  initChapterScrollSpy();
  initPortfolioFilter();
  initVfxSlider();
  initVideoModal();
  initBookingForm();
  initMetricCounters();
});

/* --------------------------------------------------------------------------
   1. PRELOADER CONTROLLER (AUTOMATIC SITE REVEAL ON COMPLETION)
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  const pctEl = document.getElementById("preloader-pct");
  const barEl = document.getElementById("preloader-bar");
  const statusEl = document.getElementById("preloader-status-text");

  if (!preloader || !pctEl || !barEl) return;

  const statuses = [
    "LOADING RENDER SHADERS",
    "DECODING 4K VIDEO STREAMS",
    "INITIALIZING VFX ENGINE",
    "ASSEMBLING STUDIO SRABON"
  ];

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 5;
    if (progress > 100) progress = 100;

    pctEl.textContent = String(progress).padStart(3, "0") + "%";
    barEl.style.width = progress + "%";

    const statusIndex = Math.min(Math.floor((progress / 100) * statuses.length), statuses.length - 1);
    if (statusEl) statusEl.textContent = statuses[statusIndex];

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(hidePreloader, 350);
    }
  }, 50);

  function hidePreloader() {
    preloader.classList.add("fade-out");
    document.body.classList.add("site-loaded");
  }
}

/* --------------------------------------------------------------------------
   2. AUDIO SYNTHESIZER TOGGLE
   -------------------------------------------------------------------------- */
function initAudioToggle() {
  const btnAudio = document.getElementById("btn-audio-toggle");
  const audioStateText = document.getElementById("audio-state-text");

  if (!btnAudio) return;

  btnAudio.addEventListener("click", () => {
    if (window.atmosphereSynth) {
      const isPlaying = window.atmosphereSynth.toggle();
      btnAudio.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      if (audioStateText) {
        audioStateText.textContent = isPlaying ? "ON" : "OFF";
      }
    }
  });
}

/* --------------------------------------------------------------------------
   3. MOBILE NAVIGATION DRAWER & BURGER ICON MORPH
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const btnMenu = document.getElementById("mobile-menu-btn");
  const drawer = document.getElementById("mobile-drawer");
  const links = drawer ? drawer.querySelectorAll(".mobile-link") : [];

  if (!btnMenu || !drawer) return;

  btnMenu.addEventListener("click", () => {
    btnMenu.classList.toggle("active");
    drawer.classList.toggle("active");
  });

  links.forEach(link => {
    link.addEventListener("click", () => {
      btnMenu.classList.remove("active");
      drawer.classList.remove("active");
    });
  });
}

/* --------------------------------------------------------------------------
   4. CHAPTER SCROLL SPY
   -------------------------------------------------------------------------- */
function initChapterScrollSpy() {
  const railItems = document.querySelectorAll(".chapter-rail li");
  const sections = document.querySelectorAll("section[id]");

  if (railItems.length === 0 || sections.length === 0) return;

  window.addEventListener("scroll", () => {
    let currentId = "";
    const scrollPos = window.scrollY + 250;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute("id");
      }
    });

    railItems.forEach(item => {
      item.classList.remove("active");
      if (item.getAttribute("data-ch") === currentId) {
        item.classList.add("active");
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. PORTFOLIO GRID FILTERING
   -------------------------------------------------------------------------- */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filterVal = btn.getAttribute("data-filter");

      projectCards.forEach(card => {
        const categories = card.getAttribute("data-category");
        const isMatch = filterVal === "all" || (categories && categories.includes(filterVal));

        if (isMatch) {
          card.style.display = "block";
          requestAnimationFrame(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0) scale(1)";
          });
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.95)";
          setTimeout(() => {
            if (card.style.opacity === "0") {
              card.style.display = "none";
            }
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. REAL-TIME 60FPS ZERO-LAG HOVER VFX REVEALER
   -------------------------------------------------------------------------- */
function initVfxSlider() {
  const sliderWidget = document.getElementById("vfx-slider-widget");
  const beforeLayer = document.getElementById("vfx-before-layer");
  const handle = document.getElementById("vfx-slider-handle");

  if (!sliderWidget || !beforeLayer || !handle) return;

  let ticking = false;
  let latestX = null;

  const renderPosition = () => {
    if (latestX === null) return;
    const rect = sliderWidget.getBoundingClientRect();
    let x = latestX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const pct = (x / rect.width) * 100;
    beforeLayer.style.setProperty("--split-percent", pct + "%");
    handle.style.left = pct + "%";
    ticking = false;
  };

  const queueUpdate = (clientX) => {
    latestX = clientX;
    if (!ticking) {
      requestAnimationFrame(renderPosition);
      ticking = true;
    }
  };

  // Synchronous, zero-latency real-time hover update
  sliderWidget.addEventListener("mousemove", (e) => {
    queueUpdate(e.clientX);
  });

  sliderWidget.addEventListener("mouseenter", (e) => {
    queueUpdate(e.clientX);
  });

  // Touch events for mobile screens
  sliderWidget.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      queueUpdate(e.touches[0].clientX);
    }
  }, { passive: true });

  sliderWidget.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) {
      queueUpdate(e.touches[0].clientX);
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   7. VIDEO MODAL CONTROLLER
   -------------------------------------------------------------------------- */
function initVideoModal() {
  const modal = document.getElementById("video-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const btnShowreel = document.getElementById("btn-play-showreel");
  const watchBtns = document.querySelectorAll(".btn-watch-modal");

  const modalTitle = document.getElementById("modal-project-title");
  const modalCat = document.getElementById("modal-project-cat");
  const modalDesc = document.getElementById("modal-project-desc");
  const modalTools = document.getElementById("modal-project-tools");
  const modalImg = document.getElementById("modal-video-img");

  const demoPlayToggle = document.getElementById("demo-play-toggle");
  const demoProgressFill = document.getElementById("demo-progress-fill");
  const demoTimeDisplay = document.getElementById("demo-time-display");

  if (!modal) return;

  let progressInterval = null;
  let isPlaying = false;
  let currentSeconds = 15;
  const totalSeconds = 165;

  const openModal = (data) => {
    if (modalTitle) modalTitle.textContent = data.title || "Project Reel";
    if (modalCat) modalCat.textContent = data.cat || "VIDEO PRODUCTION";
    if (modalDesc) modalDesc.textContent = data.desc || "Visual arts post-production project breakdown.";
    if (modalImg && data.img) modalImg.src = data.img;

    if (modalTools && data.tools) {
      const toolsArr = data.tools.split(",");
      modalTools.innerHTML = toolsArr.map(t => `<span class="sw-pill">${t.trim()}</span>`).join("");
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    startDemoPlayback();
  };

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    stopDemoPlayback();
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  if (btnShowreel) {
    btnShowreel.addEventListener("click", () => {
      openModal({
        title: "STUDIO SRABON — 2026 OFFICIAL SHOWREEL",
        cat: "SHOWREEL / COMPILATION",
        desc: "A comprehensive montage of high-tempo music video edits, 3D short animation scenes, and photorealistic VFX compositing by Nasir Uddin Shaon.",
        tools: "After Effects, Premiere Pro, Blender, Cinema 4D, DaVinci Resolve, Nuke",
        img: "./assets/images/project_cyberpunk_mv.jpg"
      });
    });
  }

  watchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".project-card");
      const thumbImg = card ? card.querySelector(".card-thumb") : null;

      openModal({
        title: btn.getAttribute("data-title"),
        cat: btn.getAttribute("data-cat"),
        desc: btn.getAttribute("data-desc"),
        tools: btn.getAttribute("data-tools"),
        img: thumbImg ? thumbImg.src : "./assets/images/project_cyberpunk_mv.jpg"
      });
    });
  });

  function startDemoPlayback() {
    isPlaying = true;
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (!isPlaying) return;
      currentSeconds++;
      if (currentSeconds > totalSeconds) currentSeconds = 0;

      const pct = (currentSeconds / totalSeconds) * 100;
      if (demoProgressFill) demoProgressFill.style.width = pct + "%";
      if (demoTimeDisplay) {
        const mins = Math.floor(currentSeconds / 60);
        const secs = String(currentSeconds % 60).padStart(2, "0");
        demoTimeDisplay.textContent = `${String(mins).padStart(2, "0")}:${secs} / 02:45`;
      }
    }, 1000);
  }

  function stopDemoPlayback() {
    isPlaying = false;
    if (progressInterval) clearInterval(progressInterval);
  }

  if (demoPlayToggle) {
    demoPlayToggle.addEventListener("click", () => {
      isPlaying = !isPlaying;
      demoPlayToggle.innerHTML = isPlaying
        ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    });
  }
}

/* --------------------------------------------------------------------------
   8. PROJECT INQUIRY FORM CONTROLLER
   -------------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.getElementById("project-booking-form");
  const feedback = document.getElementById("form-feedback");
  const btnSubmit = document.getElementById("btn-submit-booking");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>SENDING INQUIRY...</span>`;
    }

    setTimeout(() => {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>SEND PROJECT INQUIRY</span>`;
      }

      if (feedback) {
        feedback.style.display = "block";
        feedback.className = "form-feedback success";
        feedback.innerHTML = `✓ Thank you! Your project inquiry has been received. Nasir Uddin Shaon will contact you within 24 hours.`;
      }

      form.reset();
    }, 1200);
  });
}

/* --------------------------------------------------------------------------
   9. METRIC COUNTERS ANIMATION
   -------------------------------------------------------------------------- */
function initMetricCounters() {
  const counterEls = document.querySelectorAll(".metric-val");
  if (counterEls.length === 0) return;

  let animated = false;

  const runCounters = () => {
    const section = document.getElementById("ch-numbers");
    if (!section || animated) return;

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      animated = true;
      counterEls.forEach(el => {
        const target = parseInt(el.getAttribute("data-target"), 10);
        let count = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
          count += step;
          if (count >= target) {
            count = target;
            clearInterval(timer);
          }
          el.textContent = count;
        }, 30);
      });
    }
  };

  window.addEventListener("scroll", runCounters);
}

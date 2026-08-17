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
  initDynamicMarquee();
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
    if (window.innerWidth <= 1024) return;
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
  }, { passive: true });
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

  const videoPlayer = document.getElementById("modal-video-player");
  const demoDisplay = document.getElementById("modal-video-display");

  const demoPlayToggle = document.getElementById("demo-play-toggle");
  if (!modal) return;

  const openModal = (data) => {
    if (modalTitle) modalTitle.textContent = data.title || "Project Reel";
    if (modalCat) modalCat.textContent = data.cat || "VIDEO PRODUCTION";
    if (modalDesc) modalDesc.innerHTML = data.desc || "Visual arts post-production project breakdown.";

    if (modalTools && data.tools) {
      const toolsArr = data.tools.split(",");
      modalTools.innerHTML = toolsArr.map(t => `<span class="sw-pill">${t.trim()}</span>`).join("");
    }

    if (modalImg && data.img) {
      modalImg.src = data.img;
    }

    // Default to image display first
    if (demoDisplay) demoDisplay.style.display = "block";
    if (videoPlayer) {
      videoPlayer.style.display = "none";
      videoPlayer.pause();
      videoPlayer.removeAttribute("src");
      videoPlayer.onerror = null;
      videoPlayer.onloadeddata = null;
    }

    if (data.videoSrc && videoPlayer) {
      videoPlayer.controls = !data.isLoop;
      videoPlayer.loop = !!data.isLoop;
      videoPlayer.muted = !!data.isLoop;
      videoPlayer.playsInline = true;

      videoPlayer.onloadeddata = () => {
        videoPlayer.style.display = "block";
        if (demoDisplay) demoDisplay.style.display = "none";
        videoPlayer.play().catch(() => {});
      };

      videoPlayer.onerror = () => {
        // If WebM not found, keep image preview visible
        videoPlayer.style.display = "none";
        if (demoDisplay) demoDisplay.style.display = "block";
      };

      videoPlayer.src = data.videoSrc;
      videoPlayer.load();
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    modal.inert = false;
  };

  const closeModal = () => {
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;

    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
      videoPlayer.removeAttribute("src");
      videoPlayer.load();
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  if (btnShowreel) {
    btnShowreel.addEventListener("click", () => {
      openModal({
        title: "STUDIO SRABON — 2026 OFFICIAL SHOWREEL",
        cat: "SHOWREEL / COMPILATION",
        desc: "A comprehensive montage of high-tempo music video edits, 3D short animation scenes, and photorealistic VFX compositing by Nasir Uddin Shaon.",
        tools: "After Effects, Premiere Pro, Blender, Cinema 4D, DaVinci Resolve, Nuke",
        videoSrc: "./assets/videos/showreel.webm",
        isLoop: false,
        img: "./assets/images/showreelthumb.jpg"
      });
    });
  }

  watchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".project-card");
      const thumbImg = card ? card.querySelector(".card-thumb") : null;
      const projectId = card ? card.getAttribute("data-project-id") : "";
      const num = projectId ? projectId.replace(/\D/g, "") : "";
      const candidateVideo = num ? `./assets/images/projects/project${num}.webm` : "";

      openModal({
        title: btn.getAttribute("data-title"),
        cat: btn.getAttribute("data-cat"),
        desc: btn.getAttribute("data-desc"),
        tools: btn.getAttribute("data-tools"),
        videoSrc: candidateVideo,
        isLoop: true,
        img: thumbImg ? thumbImg.src : "./assets/images/fallback.jpg"
      });
    });
  });
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
      window.removeEventListener("scroll", runCounters);
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

  window.addEventListener("scroll", runCounters, { passive: true });
}

/* --------------------------------------------------------------------------
   10. DYNAMIC SEAMLESS MARQUEE TICKER (RANDOM SPAWN / ROTATING LIST)
   -------------------------------------------------------------------------- */
function initDynamicMarquee() {
  const track = document.getElementById("marquee-track");
  const sourceList = document.getElementById("marquee-items-source");
  if (!track || !sourceList) return;

  // Extract entries directly from HTML <li> elements
  const listItems = Array.from(sourceList.querySelectorAll("li"))
    .map(li => li.textContent.trim())
    .filter(Boolean);

  if (listItems.length === 0) return;

  // 1. Randomize entry spawn order
  const shuffled = [...listItems].sort(() => Math.random() - 0.5);

  // 2. Repeat entries until block is guaranteed wide enough for any viewport
  let sequenceArray = [];
  while (sequenceArray.length < 24) {
    sequenceArray = sequenceArray.concat(shuffled);
  }
  const textContent = sequenceArray.join(" • ") + " • ";

  // 3. Render twin identical blocks for 100% seamless looping
  track.innerHTML = `
    <div class="marquee-content"><span>${textContent}</span></div>
    <div class="marquee-content"><span>${textContent}</span></div>
  `;

  // 4. Calculate animation duration to enforce a constant scroll speed (50px/sec)
  const firstBlock = track.firstElementChild;
  if (firstBlock) {
    const contentWidth = firstBlock.offsetWidth;
    const SPEED_PX_PER_SEC = 50; // Constant speed in pixels per second
    const duration = contentWidth / SPEED_PX_PER_SEC;
    track.style.animationDuration = `${duration.toFixed(2)}s`;
  }
}


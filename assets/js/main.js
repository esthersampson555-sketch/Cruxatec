// ---------- Scroll reveal (runs first: most important for visible content) ----------
try {
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
} catch (err) {
  // If reveal setup fails for any reason, force everything visible
  // rather than letting the page stay blank.
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  console.error('Reveal init failed:', err);
}

// Safety net: no matter what else happens above, guarantee reveal
// content is visible shortly after load (covers edge cases like
// elements added after this script ran, or unexpected errors).
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, 1200);
});

// ---------- Rotating hero headline ----------
try {
  const heroHeadline = document.getElementById('heroHeadline');
  if (heroHeadline) {
    const headlines = [
      'Bring Your Dream Space To Life',
      'We Help Build Your Dream Home'
    ];
    let idx = 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setInterval(() => {
      idx = (idx + 1) % headlines.length;
      const nextText = headlines[idx];

      if (prefersReduced) {
        heroHeadline.innerHTML = `<span class="accent">${nextText}</span>`;
        return;
      }

      heroHeadline.classList.add('is-swapping');
      setTimeout(() => {
        heroHeadline.innerHTML = `<span class="accent">${nextText}</span>`;
        heroHeadline.classList.remove('is-swapping');
      }, 600);
    }, 30000);
  }
} catch (err) {
  console.error('Hero headline rotation failed:', err);
}

// ---------- Nav scroll state ----------
try {
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
} catch (err) {
  console.error('Nav scroll init failed:', err);
}

// ---------- Mobile nav toggle ----------
try {
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => document.body.classList.remove('nav-open'));
    });
  }
} catch (err) {
  console.error('Mobile nav init failed:', err);
}

// ---------- Hero video: two clips back-to-back, looping ----------
// Plays clip A, then clip B the moment A ends, then back to A,
// repeating for as long as the visitor is on the page. Browsers
// never allow autoplay with sound on page load without a prior
// user gesture, so this tries unmuted first and, if blocked,
// falls back to muted + the sound-toggle button below.
try {
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');
  const soundToggle = document.getElementById('heroSoundToggle');

  if (videoA && videoB) {
    let active = videoA;
    let inactive = videoB;
    let desiredMuted = false;

    const iconMuted = soundToggle ? soundToggle.querySelector('.icon-muted') : null;
    const iconUnmuted = soundToggle ? soundToggle.querySelector('.icon-unmuted') : null;

    const syncToggleUI = () => {
      if (!soundToggle) return;
      soundToggle.setAttribute('aria-pressed', String(!desiredMuted));
      soundToggle.setAttribute('aria-label', desiredMuted ? 'Turn on video sound' : 'Mute video');
      if (iconMuted && iconUnmuted) {
        iconMuted.hidden = !desiredMuted;
        iconUnmuted.hidden = desiredMuted;
      }
    };

    const playActive = () => {
      active.currentTime = 0;
      active.muted = desiredMuted;
      const p = active.play();
      if (p && p.catch) {
        p.catch(() => {
          // Autoplay with sound was blocked: fall back to muted
          // playback so the sequence still runs, and let the
          // visitor opt in via the sound button.
          if (!active.muted) {
            desiredMuted = true;
            active.muted = true;
            active.play().catch(() => {});
            syncToggleUI();
          }
        });
      }
    };

    const swap = () => {
      active.classList.remove('is-active');
      inactive.classList.add('is-active');
      const tmp = active;
      active = inactive;
      inactive = tmp;
      inactive.pause();
      playActive();
    };

    videoA.addEventListener('ended', swap);
    videoB.addEventListener('ended', swap);

    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        desiredMuted = !desiredMuted;
        active.muted = desiredMuted;
        if (!desiredMuted) {
          // Unmuting inside a user gesture; re-trigger play() so
          // browsers that require it resume with sound.
          active.play().catch(() => {});
        }
        syncToggleUI();
      });
    }

    // Try unmuted autoplay first, exactly as requested; falls
    // back to muted automatically if the browser blocks it.
    playActive();
  }
} catch (err) {
  console.error('Hero video sequence failed:', err);
}



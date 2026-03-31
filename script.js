const toRootFallback = (path) => {
  if (!path) return null;
  const clean = path.split("?")[0].split("#")[0];
  const parts = clean.split("/");
  const file = parts[parts.length - 1];
  if (!file || clean === `./${file}` || clean === file) return null;
  return `./${file}`;
};

const installMediaFallbacks = () => {
  const images = document.querySelectorAll("img[src]");
  images.forEach((img) => {
    const original = img.getAttribute("src");
    const fallback = toRootFallback(original);
    if (!fallback) return;

    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied === "1") return;
      img.dataset.fallbackApplied = "1";
      img.src = fallback;
    });
  });

  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    const tryFallback = () => {
      if (video.dataset.fallbackApplied === "1") return;

      const srcAttr = video.getAttribute("src");
      const sourceEl = video.querySelector("source[src]");
      const original = srcAttr || sourceEl?.getAttribute("src");
      const fallback = toRootFallback(original);
      if (!fallback) return;

      video.dataset.fallbackApplied = "1";
      if (srcAttr) {
        video.setAttribute("src", fallback);
      } else if (sourceEl) {
        sourceEl.setAttribute("src", fallback);
      }
      video.load();
      video.play().catch(() => {});
    };

    video.addEventListener("error", tryFallback);
    video.querySelectorAll("source[src]").forEach((source) => {
      source.addEventListener("error", tryFallback);
    });
  });
};

installMediaFallbacks();

const revealNodes = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealNodes.forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
  revealObserver.observe(node);
});

const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 24) {
    header.classList.add("is-scrolled");
    return;
  }

  header.classList.remove("is-scrolled");
});

const carousels = document.querySelectorAll("[data-carousel]");

carousels.forEach((carousel) => {
  const scope = carousel.closest(".eiviei-stage, .prensa-stage") || carousel.parentElement;
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const controls = Array.from(
    scope?.querySelectorAll("[data-slide]") || carousel.querySelectorAll("[data-slide]")
  );
  const videos = Array.from(carousel.querySelectorAll(".carousel-slide video"));
  const thumbVideos = Array.from(
    scope?.querySelectorAll(".carousel-thumb video") || []
  );
  let activeIndex = 0;
  let intervalId;

  const syncMedia = () => {
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });

    const activeVideo = slides[activeIndex]?.querySelector("video");
    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }

    thumbVideos.forEach((video, index) => {
      if (index === activeIndex) {
        video.play().catch(() => {});
        return;
      }

      video.pause();
      video.currentTime = 0;
    });
  };

  const goTo = (index) => {
    activeIndex = index;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    controls.forEach((control, controlIndex) => {
      control.classList.toggle("is-active", controlIndex === activeIndex);
    });

    syncMedia();
  };

  const start = () => {
    intervalId = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      goTo(nextIndex);
    }, 4200);
  };

  const stop = () => {
    window.clearInterval(intervalId);
  };

  controls.forEach((control, index) => {
    control.addEventListener("click", () => {
      stop();
      goTo(index);
      start();
    });
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);

  goTo(0);
  start();
});

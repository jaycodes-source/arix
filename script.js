/* =========================================
   ARIX — MAIN WEBSITE SCRIPT
   Web-only version
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const app = document.getElementById("app");
  const skipIntro = document.getElementById("skipIntro");

  /* ---------- INTRO ---------- */

  function enterWebsite() {
    if (intro) {
      intro.classList.add("intro-hidden");
    }

    if (app) {
      app.classList.add("ready");
    }

    document.body.classList.add("arix-loaded");
  }

  // Automatically leave intro
  setTimeout(enterWebsite, 4500);

  // Skip button
  if (skipIntro) {
    skipIntro.addEventListener("click", enterWebsite);
  }

  /* ---------- STORY DATA ---------- */

  const stories =
    window.ARIX?.stories ||
    window.ARIX_STORIES ||
    [];

  const storyGrid = document.getElementById("storyGrid");

  function renderStories(list = stories) {
    if (!storyGrid) return;

    if (!list.length) {
      storyGrid.innerHTML = `
        <div class="empty-state">
          <h3>No stories found</h3>
          <p>Stories will appear here when they are added.</p>
        </div>
      `;
      return;
    }

    storyGrid.innerHTML = list.map(story => `
      <article class="story-card" data-story-id="${story.id}">
        <div class="story-cover">
          ${
            story.cover
              ? `<img src="${story.cover}" alt="${story.title}">`
              : `<div class="cover-placeholder">
                  <span>ARIX</span>
                </div>`
          }

          <div class="story-type">
            ${story.type || "Story"}
          </div>
        </div>

        <div class="story-info">
          <h3>${story.title}</h3>

          <p class="story-meta">
            ${story.genre || "General"} •
            ${story.status || "Ongoing"}
          </p>

          <div class="story-rating">
            ★ ${story.rating || "—"}
          </div>

          <div class="story-actions">
            <button class="read-story" data-id="${story.id}">
              Read
            </button>

            <button class="bookmark-story" data-id="${story.id}">
              ♡
            </button>
          </div>
        </div>
      </article>
    `).join("");
  }

  renderStories();

  /* ---------- SEARCH ---------- */

  const searchInput = document.getElementById("searchInput");
  const searchPanel = document.getElementById("searchPanel");
  const searchButton = document.getElementById("searchButton");

  if (searchButton && searchPanel) {
    searchButton.addEventListener("click", () => {
      searchPanel.classList.toggle("active");

      if (searchPanel.classList.contains("active") && searchInput) {
        searchInput.focus();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      if (!query) {
        renderStories();
        return;
      }

      const results = stories.filter(story =>
        `${story.title} ${story.genre} ${story.type} ${story.author}`
          .toLowerCase()
          .includes(query)
      );

      renderStories(results);
    });
  }

  /* ---------- MOBILE MENU ---------- */

  const menuButton = document.getElementById("mobileMenuButton");
  const mobileNav = document.getElementById("mobileNav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      mobileNav.classList.toggle("active");
    });
  }

  /* ---------- NAVIGATION ---------- */

  document.querySelectorAll("[data-scroll]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(
        button.dataset.scroll
      );

      if (target) {
        target.scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  });

  /* ---------- THEME ---------- */

  const themeButton = document.getElementById("themeToggle");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");

      localStorage.setItem(
        "arix_theme",
        document.body.classList.contains("light-theme")
          ? "light"
          : "dark"
      );
    });
  }

  const savedTheme = localStorage.getItem("arix_theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }

  /* ---------- STORY READER ---------- */

  const readerModal = document.getElementById("readerModal");
  const readerPages = document.getElementById("readerPages");
  const readerTitle = document.getElementById("readerTitle");
  const pageCounter = document.getElementById("readerPageCounter");
  const progressBar = document.getElementById("readerProgressBar");

  let currentStory = null;
  let currentPage = 0;

  function openReader(id) {
    const story = stories.find(item => item.id === id);

    if (!story || !readerModal) return;

    currentStory = story;
    currentPage = 0;

    if (readerTitle) {
      readerTitle.textContent = story.title;
    }

    renderReaderPage();

    readerModal.classList.add("active");
    document.body.classList.add("reader-open");
  }

  function renderReaderPage() {
    if (!currentStory || !readerPages) return;

    const pages = currentStory.pages || [];

    if (!pages.length) {
      readerPages.innerHTML = `
        <div class="reader-empty">
          <div>
            <h2>${currentStory.title}</h2>
            <p>
              This story does not have comic pages yet.
              Add page images to the story data to begin reading.
            </p>
          </div>
        </div>
      `;
    } else {
      readerPages.innerHTML = `
        <img
          src="${pages[currentPage]}"
          alt="${currentStory.title} page ${currentPage + 1}"
        >
      `;
    }

    const total = pages.length || 1;

    if (pageCounter) {
      pageCounter.textContent =
        `${currentPage + 1} / ${total}`;
    }

    if (progressBar) {
      progressBar.style.width =
        `${((currentPage + 1) / total) * 100}%`;
    }
  }

  document.addEventListener("click", event => {
    const readButton =
      event.target.closest(".read-story");

    if (readButton) {
      openReader(readButton.dataset.id);
    }
  });

  /* ---------- CLOSE READER ---------- */

  const closeReader =
    document.getElementById("closeReader");

  if (closeReader) {
    closeReader.addEventListener("click", () => {
      readerModal?.classList.remove("active");
      document.body.classList.remove("reader-open");
    });
  }

  /* ---------- READER CONTROLS ---------- */

  const nextPage =
    document.getElementById("nextPage");

  const previousPage =
    document.getElementById("previousPage");

  if (nextPage) {
    nextPage.addEventListener("click", () => {
      if (!currentStory?.pages?.length) return;

      if (currentPage < currentStory.pages.length - 1) {
        currentPage++;
        renderReaderPage();
      }
    });
  }

  if (previousPage) {
    previousPage.addEventListener("click", () => {
      if (!currentStory?.pages?.length) return;

      if (currentPage > 0) {
        currentPage--;
        renderReaderPage();
      }
    });
  }

  /* ---------- KEYBOARD ---------- */

  document.addEventListener("keydown", event => {
    if (!readerModal?.classList.contains("active")) return;

    if (event.key === "ArrowRight") {
      nextPage?.click();
    }

    if (event.key === "ArrowLeft") {
      previousPage?.click();
    }

    if (event.key === "Escape") {
      closeReader?.click();
    }
  });

  /* ---------- FULLSCREEN ---------- */

  const fullscreenButton =
    document.getElementById("fullscreenReader");

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", () => {
      if (!readerModal) return;

      if (!document.fullscreenElement) {
        readerModal.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
  }

  /* ---------- FINAL SAFETY ---------- */

  // Never allow the website to remain invisible
  setTimeout(() => {
    if (app) {
      app.classList.add("ready");
    }
  }, 5500);
});
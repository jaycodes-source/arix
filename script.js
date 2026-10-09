
/* =========================================
   ARIX — MAIN WEBSITE SCRIPT
   Corrected web-only version
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ---------- ELEMENTS ---------- */

  const intro = document.getElementById("intro");
  const app = document.getElementById("app");
  const skipIntro = document.getElementById("skipIntro");

  /* ---------- INTRO ---------- */

  function enterWebsite() {
    intro?.classList.add("intro-hidden");
    app?.classList.add("ready");
    document.body.classList.add("arix-loaded");
  }

  const introTimer = setTimeout(enterWebsite, 4500);

  skipIntro?.addEventListener("click", () => {
    clearTimeout(introTimer);
    enterWebsite();
  });

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
        <div class="no-results">
          <h3>No stories found</h3>
          <p>Try another search or check back later.</p>
        </div>
      `;
      return;
    }

    storyGrid.innerHTML = list.map(story => `
      <article class="story-card" data-story-id="${story.id}">
        <div class="story-cover">
          ${
            story.cover
              ? `<img src="${story.cover}" alt="${story.title}" loading="lazy">`
              : `<div class="story-cover-placeholder">
                   <span>${story.title}</span>
                 </div>`
          }
          <span class="story-badge">
            ${story.type || "Story"}
          </span>
        </div>

        <div class="story-info">
          <h3 class="story-title">${story.title}</h3>

          <div class="story-meta">
            <span>${story.genre || "General"}</span>
            <span>•</span>
            <span>${story.status || "Ongoing"}</span>
          </div>

          <p class="story-description">
            ${story.description || "Discover this story on ARIX."}
          </p>

          <div class="story-meta">
            <span>★ ${story.rating ?? "—"}</span>
          </div>

          <div class="story-actions">
            <button class="read-story" data-id="${story.id}" type="button">
              Read
            </button>
            <button
              class="bookmark-story"
              data-id="${story.id}"
              type="button"
              aria-label="Bookmark ${story.title}"
            >♡</button>
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

  function filterStories() {
    const query = searchInput?.value.trim().toLowerCase() || "";

    if (!query) {
      renderStories();
      return;
    }

    const results = stories.filter(story => {
      const searchable = [
        story.title,
        story.genre,
        story.type,
        story.author,
        story.description
      ].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(query);
    });

    renderStories(results);
  }

  searchButton?.addEventListener("click", () => {
    searchPanel?.classList.toggle("open");

    if (searchPanel?.classList.contains("open")) {
      searchInput?.focus();
    }
  });

  searchInput?.addEventListener("input", filterStories);

  /* ---------- MOBILE MENU ---------- */

  const menuButton = document.getElementById("mobileMenuButton");
  const mobileNav = document.getElementById("mobileNav");

  menuButton?.addEventListener("click", () => {
    const isOpen = mobileNav?.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  mobileNav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- SECTION NAVIGATION ---------- */

  document.querySelectorAll("[data-scroll]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scroll);

      target?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* ---------- GENRE FILTERING ---------- */

  document.querySelectorAll("[data-genre]").forEach(card => {
    card.addEventListener("click", () => {
      const genre = card.dataset.genre;

      const results = stories.filter(story =>
        String(story.genre || "")
          .toLowerCase()
          .includes(String(genre || "").toLowerCase())
      );

      renderStories(results);

      storyGrid?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* ---------- THEME ---------- */

  const themeButton =
    document.getElementById("themeToggle");

  try {
    if (localStorage.getItem("arix_theme") === "light") {
      document.body.classList.add("light-theme");
    }
  } catch (error) {
    console.warn("ARIX could not load the saved theme.");
  }

  themeButton?.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    try {
      localStorage.setItem(
        "arix_theme",
        document.body.classList.contains("light-theme")
          ? "light"
          : "dark"
      );
    } catch (error) {
      console.warn("ARIX could not save the theme.");
    }
  });

  /* ---------- STORAGE ---------- */

  const STORAGE = {
    bookmarks: "arix_bookmarks",
    history: "arix_reading_history",
    lastPage: "arix_last_page"
  };

  function readStorage(key, fallback = []) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("ARIX could not save data.");
    }
  }

  function getBookmarks() {
    return readStorage(STORAGE.bookmarks, []);
  }

  function getHistory() {
    return readStorage(STORAGE.history, []);
  }

  function saveHistory(storyId) {
    const history = getHistory().filter(item =>
      String(typeof item === "object" ? item.id : item) !== String(storyId)
    );

    history.unshift({
      id: storyId,
      date: Date.now()
    });

    writeStorage(STORAGE.history, history.slice(0, 50));
  }

  function toggleBookmark(storyId) {
    const bookmarks = getBookmarks();
    const index = bookmarks.findIndex(item =>
      String(typeof item === "object" ? item.id : item) === String(storyId)
    );

    if (index >= 0) {
      bookmarks.splice(index, 1);
      showToast("Removed from your library");
    } else {
      bookmarks.push(storyId);
      showToast("Added to your library");
    }

    writeStorage(STORAGE.bookmarks, bookmarks);
    updateProfileStats();
    renderLibrary();
    updateBookmarkButtons();
  }

  function updateBookmarkButtons() {
    const bookmarks = getBookmarks().map(item =>
      String(typeof item === "object" ? item.id : item)
    );

    document.querySelectorAll(".bookmark-story").forEach(button => {
      const saved = bookmarks.includes(String(button.dataset.id));

      button.textContent = saved ? "♥" : "♡";
      button.setAttribute("aria-pressed", String(saved));
    });
  }

  /* ---------- BOOKMARK BUTTONS ---------- */

  document.addEventListener("click", event => {
    const button = event.target.closest(".bookmark-story");
    if (!button) return;

    toggleBookmark(button.dataset.id);
  });

  /* ---------- LIBRARY ---------- */

  const libraryGrid = document.getElementById("libraryGrid");

  function renderLibrary() {
    if (!libraryGrid) return;

    const bookmarkIds = getBookmarks().map(item =>
      String(typeof item === "object" ? item.id : item)
    );

    const savedStories = stories.filter(story =>
      bookmarkIds.includes(String(story.id))
    );

    if (!savedStories.length) {
      libraryGrid.innerHTML = `
        <div class="library-empty">
          <strong>Your library is empty</strong>
          Bookmark a story to find it here.
        </div>
      `;
      return;
    }

    libraryGrid.innerHTML = savedStories.map(story => `
      <article class="story-card">
        <div class="story-cover">
          ${
            story.cover
              ? `<img src="${story.cover}" alt="${story.title}" loading="lazy">`
              : `<div class="story-cover-placeholder">
                   <span>${story.title}</span>
                 </div>`
          }
        </div>
        <div class="story-info">
          <h3 class="story-title">${story.title}</h3>
          <div class="story-meta">${story.genre || "General"}</div>
          <div class="story-actions">
            <button class="read-story" data-id="${story.id}" type="button">
              Read
            </button>
            <button class="bookmark-story" data-id="${story.id}" type="button">
              ♥
            </button>
          </div>
        </div>
      </article>
    `).join("");

    updateBookmarkButtons();
  }

  /* ---------- CONTINUE READING ---------- */

  const continueGrid = document.getElementById("continueGrid");

  function renderContinueReading() {
    if (!continueGrid) return;

    const history = getHistory();

    const recentStories = history
      .map(item => {
        const id = typeof item === "object" ? item.id : item;
        return stories.find(story => String(story.id) === String(id));
      })
      .filter(Boolean);

    if (!recentStories.length) {
      continueGrid.innerHTML = `
        <div class="library-empty">
          <strong>Nothing here yet</strong>
          Open a story and it will appear here.
        </div>
      `;
      return;
    }

    continueGrid.innerHTML = recentStories.map(story => `
      <article class="continue-card">
        <div class="continue-cover">
          ${
            story.cover
              ? `<img src="${story.cover}" alt="${story.title}" loading="lazy">`
              : ""
          }
        </div>
        <div class="continue-info">
          <h3 class="continue-title">${story.title}</h3>
          <p class="continue-chapter">${story.type || "Story"}</p>
          <button class="read-story" data-id="${story.id}" type="button">
            Continue
          </button>
        </div>
      </article>
    `).join("");
  }

  /* ---------- READER ---------- */

  const readerModal = document.getElementById("readerModal");
  const readerPages = document.getElementById("readerPages");
  const readerTitle = document.getElementById("readerTitle");
  const pageCounter = document.getElementById("readerPageCounter");
  const progressBar = document.getElementById("readerProgressBar");

  let currentStory = null;
  let currentPage = 0;
  let zoomLevel = 1;

  function getSavedPage(storyId) {
    const pages = readStorage(STORAGE.lastPage, {});
    return Number(pages[storyId]) || 0;
  }

  function saveCurrentPage() {
    if (!currentStory) return;

    const pages = readStorage(STORAGE.lastPage, {});
    pages[currentStory.id] = currentPage;

    writeStorage(STORAGE.lastPage, pages);
  }

  function openReader(storyId) {
    currentStory = stories.find(story =>
      String(story.id) === String(storyId)
    );

    if (!currentStory || !readerModal) return;

    const pages = currentStory.pages || [];
    currentPage = Math.min(
      getSavedPage(currentStory.id),
      Math.max(0, pages.length - 1)
    );

    zoomLevel = 1;

    if (readerTitle) {
      readerTitle.textContent = currentStory.title;
    }

    saveHistory(currentStory.id);
    renderReaderPage();

    readerModal.classList.add("open");
    document.body.classList.add("reader-open", "no-scroll");

    renderContinueReading();
    updateProfileStats();
  }

  function renderReaderPage() {
    if (!currentStory || !readerPages) return;

    const pages = currentStory.pages || [];

    if (!pages.length) {
      readerPages.innerHTML = `
        <div class="library-empty">
          <strong>${currentStory.title}</strong>
          <p>This story has no page images yet.</p>
        </div>
      `;
    } else {
      readerPages.innerHTML = `
        <img
          src="${pages[currentPage]}"
          alt="${currentStory.title}, page ${currentPage + 1}"
          style="transform:scale(${zoomLevel});transform-origin:center;"
        >
      `;
    }

    const total = pages.length || 1;

    if (pageCounter) {
      pageCounter.textContent = `${currentPage + 1} / ${total}`;
    }

    if (progressBar) {
      progressBar.style.width =
        `${((currentPage + 1) / total) * 100}%`;
    }

    saveCurrentPage();
  }

  /* ---------- OPEN STORY ---------- */

  document.addEventListener("click", event => {
    const button = event.target.closest(".read-story");
    if (button) openReader(button.dataset.id);
  });

  /* ---------- CLOSE READER ---------- */

  const closeReader = document.getElementById("closeReader");

  function closeReaderModal() {
    readerModal?.classList.remove("open");
    document.body.classList.remove("reader-open", "no-scroll");
  }

  closeReader?.addEventListener("click", closeReaderModal);

  readerModal?.addEventListener("click", event => {
    if (event.target === readerModal) closeReaderModal();
  });

  /* ---------- PAGE CONTROLS ---------- */

  const nextPage = document.getElementById("nextPage");
  const previousPage = document.getElementById("previousPage");

  nextPage?.addEventListener("click", () => {
    if (!currentStory?.pages?.length) return;

    if (currentPage < currentStory.pages.length - 1) {
      currentPage++;
      renderReaderPage();
    }
  });

  previousPage?.addEventListener("click", () => {
    if (!currentStory?.pages?.length) return;

    if (currentPage > 0) {
      currentPage--;
      renderReaderPage();
    }
  });

  /* ---------- ZOOM ---------- */

  document.getElementById("zoomIn")?.addEventListener("click", () => {
    zoomLevel = Math.min(zoomLevel + 0.15, 2.5);
    renderReaderPage();
  });

  document.getElementById("zoomOut")?.addEventListener("click", () => {
    zoomLevel = Math.max(zoomLevel - 0.15, 0.5);
    renderReaderPage();
  });

  /* ---------- FULLSCREEN ---------- */

  document.getElementById("fullscreenReader")?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await readerModal?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      showToast("Fullscreen is not available");
    }
  });

  /* ---------- KEYBOARD CONTROLS ---------- */

  document.addEventListener("keydown", event => {
    if (!readerModal?.classList.contains("open")) return;

    if (event.key === "ArrowRight") nextPage?.click();
    if (event.key === "ArrowLeft") previousPage?.click();

    if (event.key === "Escape" && !document.fullscreenElement) {
      closeReaderModal();
    }
  });

  /* ---------- TOAST MESSAGES ---------- */

  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;

    if (toastMessage) {
      toastMessage.textContent = message;
    } else {
      toast.textContent = message;
    }

    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  /* ---------- PROFILE PANEL ---------- */

  const profilePanel = document.getElementById("profilePanel");
  const profileButton = document.getElementById("profileButton");

  profileButton?.addEventListener("click", () => {
    profilePanel?.classList.toggle("open");
    notificationPanel?.classList.remove("open");
  });

  /* ---------- PROFILE STATISTICS ---------- */

  function updateProfileStats() {
    const bookmarkCount = document.getElementById("bookmarkCount");
    const historyCount = document.getElementById("historyCount");

    if (bookmarkCount) {
      bookmarkCount.textContent = getBookmarks().length;
    }

    if (historyCount) {
      historyCount.textContent = getHistory().length;
    }
  }

  /* ---------- NOTIFICATIONS ---------- */

  const notificationPanel =
    document.getElementById("notificationPanel");

  const notificationButton =
    document.getElementById("notificationButton");

  notificationButton?.addEventListener("click", () => {
    notificationPanel?.classList.toggle("open");
    profilePanel?.classList.remove("open");
  });

  /* ---------- CLOSE PANELS ---------- */

  document.querySelectorAll("[data-close-panel]").forEach(button => {
    button.addEventListener("click", () => {
      profilePanel?.classList.remove("open");
      notificationPanel?.classList.remove("open");
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      profilePanel?.classList.remove("open");
      notificationPanel?.classList.remove("open");
    }
  });

  /* ---------- VIEW ALL STORIES ---------- */

  document.querySelectorAll("[data-view-all]").forEach(button => {
    button.addEventListener("click", () => {
      renderStories();

      storyGrid?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* ---------- MOBILE BOTTOM NAV ---------- */

  document.querySelectorAll(".mobile-bottom-nav a").forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  /* ---------- INITIAL RENDER ---------- */

  renderStories();
  renderLibrary();
  renderContinueReading();
  updateBookmarkButtons();
  updateProfileStats();

  /* ---------- STARTUP SAFETY ---------- */

  setTimeout(() => {
    enterWebsite();
  }, 5500);

  console.log("ARIX website initialized successfully.");

});

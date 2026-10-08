/* =========================================================
   ARIX — MAIN APPLICATION SCRIPT
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const ARIX = window.ARIX;

  if (!ARIX) {
    console.error("ARIX data module was not loaded.");
    return;
  }

  const {
    stories,
    helpers,
    storageKeys
  } = ARIX;

  const {
    getStoryById,
    getStoriesByGenre,
    searchStories,
    getFeaturedStories,
    getBookmarks,
    isBookmarked,
    toggleBookmark,
    getReadingHistory,
    saveReadingProgress,
    getStoryProgress,
    getReactions,
    setReaction,
    getReaction,
    getProfile,
    saveProfile
  } = helpers;

  /* =========================================================
     STATE
     ========================================================= */

  const state = {
    currentStory: null,
    currentPage: 0,
    zoom: 1,
    searchOpen: false,
    genre: "All",
    installPrompt: null,
    introSkipped: false
  };

  /* =========================================================
     DOM
     ========================================================= */

  const intro = $("#intro");
  const app = $("#app");

  const storyGrid = $("#storyGrid");
  const searchPanel = $("#searchPanel");
  const searchInput = $("#searchInput");
  const searchResults = $("#searchResults");

  const readerModal = $("#readerModal");
  const readerTitle = $("#readerTitle");
  const readerPages = $("#readerPages");
  const readerPageCounter = $("#readerPageCounter");
  const readerProgressBar = $("#readerProgressBar");

  const profilePanel = $("#profilePanel");
  const notificationPanel = $("#notificationPanel");

  /* =========================================================
     UTILITIES
     ========================================================= */

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message, type = "default") {
    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  function scrollToSection(id) {
    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function closePanels() {
    profilePanel?.classList.remove("active");
    notificationPanel?.classList.remove("active");
    searchPanel?.classList.remove("active");
  }

  /* =========================================================
     INTRO
     ========================================================= */

  function finishIntro() {
    if (state.introSkipped) return;

    state.introSkipped = true;

    if (intro) {
      intro.classList.add("hidden");

      setTimeout(() => {
        intro.style.display = "none";
      }, 800);
    }

    if (app) {
      app.classList.add("ready");
    }
  }

  function initIntro() {
    const skipButton = $("#skipIntro");

    skipButton?.addEventListener("click", finishIntro);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      finishIntro();
      return;
    }

    setTimeout(finishIntro, 4500);
  }

  /* =========================================================
     STORY CARDS
     ========================================================= */

  function getCoverHTML(story) {
    if (story.cover) {
      return `
        <img
          src="${escapeHTML(story.cover)}"
          alt="${escapeHTML(story.title)} cover"
          class="story-cover"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
        >
        <div class="cover-placeholder" style="display:none;">
          <img src="assets/logo.png" alt="ARIX">
        </div>
      `;
    }

    return `
      <div class="cover-placeholder">
        <img src="assets/logo.png" alt="ARIX">
        <span>${escapeHTML(story.type)}</span>
      </div>
    `;
  }

  function renderStoryCard(story) {
    const bookmarked = isBookmarked(story.id);
    const reaction = getReaction(story.id);

    return `
      <article class="story-card" data-story-id="${escapeHTML(story.id)}">

        <div class="story-card-cover">
          ${getCoverHTML(story)}

          <span class="story-type">
            ${escapeHTML(story.type)}
          </span>

          ${
            story.status
              ? `<span class="story-status">${escapeHTML(story.status)}</span>`
              : ""
          }

          <button
            class="bookmark-btn ${bookmarked ? "active" : ""}"
            data-action="bookmark"
            data-id="${escapeHTML(story.id)}"
            aria-label="Bookmark ${escapeHTML(story.title)}"
          >
            ${bookmarked ? "★" : "☆"}
          </button>
        </div>

        <div class="story-card-body">

          <div class="story-meta">
            <span>${escapeHTML(story.genre)}</span>
            <span>★ ${story.rating}</span>
          </div>

          <h3>${escapeHTML(story.title)}</h3>

          <p>
            ${escapeHTML(story.description)}
          </p>

          <div class="story-card-footer">

            <button
              class="primary-btn small"
              data-action="read"
              data-id="${escapeHTML(story.id)}"
            >
              Read
            </button>

            <button
              class="reaction-btn ${reaction === "like" ? "active" : ""}"
              data-action="like"
              data-id="${escapeHTML(story.id)}"
              aria-label="Like"
            >
              ♥
            </button>

            <button
              class="reaction-btn ${
                reaction === "dislike" ? "active" : ""
              }"
              data-action="dislike"
              data-id="${escapeHTML(story.id)}"
              aria-label="Dislike"
            >
              ×
            </button>

          </div>

        </div>
      </article>
    `;
  }

  function renderStories(list = stories) {
    if (!storyGrid) return;

    if (!list.length) {
      storyGrid.innerHTML = `
        <div class="empty-state">
          <img src="assets/logo.png" alt="ARIX">
          <h3>No stories found</h3>
          <p>Try another search or genre.</p>
        </div>
      `;
      return;
    }

    storyGrid.innerHTML = list.map(renderStoryCard).join("");
  }

  /* =========================================================
     STORY ACTIONS
     ========================================================= */

  function handleStoryAction(action, id) {
    const story = getStoryById(id);

    if (!story) return;

    if (action === "read") {
      openReader(story);
      return;
    }

    if (action === "bookmark") {
      const active = toggleBookmark(id);

      renderStories(getFilteredStories());

      showToast(
        active
          ? `${story.title} added to your library.`
          : `${story.title} removed from your library.`
      );

      return;
    }

    if (action === "like" || action === "dislike") {
      const current = getReaction(id);

      setReaction(
        id,
        current === action ? null : action
      );

      renderStories(getFilteredStories());

      showToast(
        current === action
          ? "Reaction removed."
          : action === "like"
            ? "You liked this story."
            : "You disliked this story."
      );
    }
  }

  /* =========================================================
     FILTERING
     ========================================================= */

  function getFilteredStories() {
    if (state.genre === "All") {
      return stories;
    }

    return getStoriesByGenre(state.genre);
  }

  function filterByGenre(genre) {
    state.genre = genre;

    renderStories(getFilteredStories());

    const heading = $("#discoverTitle");

    if (heading) {
      heading.textContent =
        genre === "All"
          ? "Discover"
          : `${genre} Stories`;
    }

    scrollToSection("discover");
  }

  /* =========================================================
     SEARCH
     ========================================================= */

  function openSearch() {
    if (!searchPanel) return;

    searchPanel.classList.add("active");
    state.searchOpen = true;

    setTimeout(() => {
      searchInput?.focus();
    }, 150);
  }

  function closeSearch() {
    searchPanel?.classList.remove("active");
    state.searchOpen = false;

    if (searchInput) {
      searchInput.value = "";
    }

    if (searchResults) {
      searchResults.innerHTML = "";
    }
  }

  function renderSearchResults(query) {
    if (!searchResults) return;

    const results = searchStories(query);

    if (!query.trim()) {
      searchResults.innerHTML = "";
      return;
    }

    if (!results.length) {
      searchResults.innerHTML = `
        <div class="search-empty">
          No stories match "${escapeHTML(query)}".
        </div>
      `;
      return;
    }

    searchResults.innerHTML = results
      .slice(0, 8)
      .map(
        story => `
          <button
            class="search-result"
            data-action="search-read"
            data-id="${escapeHTML(story.id)}"
          >
            <div class="search-result-cover">
              ${getCoverHTML(story)}
            </div>

            <div>
              <strong>${escapeHTML(story.title)}</strong>
              <span>
                ${escapeHTML(story.genre)} · ${escapeHTML(story.type)}
              </span>
            </div>
          </button>
        `
      )
      .join("");
  }

  /* =========================================================
     READER
     ========================================================= */

  function openReader(story) {
    if (!readerModal) return;

    state.currentStory = story;

    const savedPage = getStoryProgress(story.id);

    state.currentPage =
      Number.isInteger(savedPage) && savedPage >= 0
        ? savedPage
        : 0;

    state.zoom = 1;

    if (readerTitle) {
      readerTitle.textContent = story.title;
    }

    renderReaderPage();

    readerModal.classList.add("active");
    document.body.classList.add("reader-open");

    closePanels();
  }

  function closeReader() {
    if (!readerModal) return;

    readerModal.classList.remove("active");
    document.body.classList.remove("reader-open");

    state.currentStory = null;
    state.currentPage = 0;
    state.zoom = 1;
  }

  function renderReaderPage() {
    const story = state.currentStory;

    if (!story || !readerPages) return;

    const pages = story.pages || [];

    /*
      If no comic pages have been uploaded yet,
      show a professional placeholder instead of
      a broken image.
    */

    if (!pages.length) {
      readerPages.innerHTML = `
        <div class="reader-placeholder">

          <img src="assets/logo.png" alt="ARIX">

          <h2>${escapeHTML(story.title)}</h2>

          <p>
            Chapter pages will appear here when they are
            uploaded to ARIX.
          </p>

          <span>
            Demo reader
          </span>

        </div>
      `;

      updateReaderUI(0, 1);
      return;
    }

    if (state.currentPage >= pages.length) {
      state.currentPage = pages.length - 1;
    }

    const page = pages[state.currentPage];

    readerPages.innerHTML = `
      <img
        src="${escapeHTML(page)}"
        alt="${escapeHTML(story.title)} page ${state.currentPage + 1}"
        class="reader-image"
        style="transform:scale(${state.zoom})"
        draggable="false"
      >
    `;

    updateReaderUI(
      state.currentPage,
      pages.length
    );
  }

  function updateReaderUI(page, total) {
    if (readerPageCounter) {
      readerPageCounter.textContent =
        `${page + 1} / ${total}`;
    }

    if (readerProgressBar) {
      const percentage =
        total <= 1
          ? 100
          : ((page + 
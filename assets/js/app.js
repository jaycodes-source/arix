
/* ARIX WEBSITE INTERACTIONS */
(() => {
  "use strict";

  const stories = window.ARIX_STORIES || [];
  const $ = id => document.getElementById(id);

  let bookmarks = readStorage("arix-bookmarks", []);
  let readingHistory = readStorage("arix-history", []);
  let currentStory = null;
  let activeFilter = "All";

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("ARIX could not save this setting.");
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function showToast(message) {
    let toast = $("toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function createStoryCard(story) {
    const saved = bookmarks.includes(story.id);

    return `
      <article class="story-card"
        tabindex="0"
        role="button"
        data-open-story="${escapeHTML(story.id)}">

        <div class="cover-art"
          style="--cover-bg:${story.bg};
                 --cover-glow:${story.glow}">

          <span class="cover-badge">
            ${escapeHTML(story.badge)}
          </span>

          <button
            type="button"
            class="bookmark-button ${saved ? "saved" : ""}"
            data-bookmark="${escapeHTML(story.id)}"
            aria-label="Toggle bookmark">
            ${saved ? "★" : "☆"}
          </button>

          <span class="cover-orb"></span>

          <span class="cover-rune">
            ${escapeHTML(story.rune)}
          </span>

          <span class="cover-title">
            ${escapeHTML(story.title)}
          </span>

          <span class="cover-subtitle">
            ${escapeHTML(story.genre)} · ARIX
          </span>
        </div>

        <div class="story-meta">
          <h3>${escapeHTML(story.title)}</h3>

          <div class="story-submeta">
            <span>${escapeHTML(story.type)}</span>
            <span>★ ${escapeHTML(story.rating)}
              · Ch. ${escapeHTML(story.chapter)}
            </span>
          </div>
        </div>
      </article>
    `;
  }

  function renderGrid(
    elementId,
    list,
    emptyTitle = "Nothing here yet",
    emptyMessage = "Explore ARIX to discover stories."
  ) {
    const element = $(elementId);

    if (!element) return;

    if (!list.length) {
      element.innerHTML = `
        <div class="empty-state">
          <b>${escapeHTML(emptyTitle)}</b>
          <p>${escapeHTML(emptyMessage)}</p>
        </div>
      `;
      return;
    }

    element.innerHTML = list.map(createStoryCard).join("");
  }

  function renderStories() {
    renderGrid("homeTrending", stories.slice(0, 4));

    renderGrid(
      "trendingGrid",
      [...stories].sort(
        (a, b) => Number(b.rating) - Number(a.rating)
      )
    );

    renderGrid(
      "discoverGrid",
      stories.filter(story =>
        activeFilter === "All" ||
        story.type === activeFilter
      )
    );

    renderGrid(
      "continueGrid",
      readingHistory
        .map(id => stories.find(story => story.id === id))
        .filter(Boolean)
        .slice(0, 4),
      "Your reading journey starts here",
      "Open a story to see it here."
    );

    renderGrid(
      "libraryGrid",
      bookmarks
        .map(id => stories.find(story => story.id === id))
        .filter(Boolean),
      "Your library is waiting",
      "Tap the star on a story to save it."
    );

    renderGenres();
  }

  function renderGenres() {
    const genres = [
      ["Fantasy", "✧", "#a78bfa"],
      ["Action", "⚔", "#ff8a65"],
      ["Romance", "♡", "#ff76b7"],
      ["Sci-Fi", "⌁", "#67dff9"],
      ["Adventure", "⟡", "#7ee0bd"],
      ["Mystery", "◉", "#69b8ff"],
      ["Sports", "↗", "#f4c86b"]
    ];

    const html = genres.map(([genre, symbol, color]) => {
      const count = stories.filter(
        story => story.genre === genre
      ).length;

      return `
        <button type="button"
          class="genre-card"
          data-genre="${genre}"
          style="--genre-color:${color}">

          <span class="genre-symbol">${symbol}</span>

          <span>
            <b>${genre}</b>
            <small>${count} stories</small>
          </span>
        </button>
      `;
    }).join("");

    if ($("homeGenres")) {
      $("homeGenres").innerHTML = html;
    }

    if ($("genrePageGrid")) {
      $("genrePageGrid").innerHTML = html;
    }
  }

  function navigate(viewName) {
    const validViews = [
      "home",
      "discover",
      "trending",
      "genres",
      "library",
      "search",
      "profile",
      "reader"
    ];

    if (!validViews.includes(viewName)) {
      viewName = "home";
    }

    document.querySelectorAll(".view").forEach(view => {
      view.classList.toggle(
        "active",
        view.dataset.view === viewName
      );
    });

    document.querySelectorAll("[data-nav]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.nav === viewName
      );
    });

    if (location.hash !== "#" + viewName) {
      try {
        window.history.replaceState(
          null,
          "",
          "#" + viewName
        );
      } catch (error) {}
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function searchStories() {
    const input = $("searchInput");

    if (!input) return;

    const query = input.value.trim().toLowerCase();

    if (!query) {
      renderGrid(
        "searchGrid",
        [],
        "Search ARIX",
        "Enter a title, genre, or story format."
      );
      return;
    }

    const results = stories.filter(story => {
      const searchableText = [
        story.title,
        story.genre,
        story.type,
        story.description
      ].join(" ").toLowerCase();

      return searchableText.includes(query);
    });

    renderGrid(
      "searchGrid",
      results,
      "No matching stories",
      "Try another title or genre."
    );

    if ($("searchCaption")) {
      $("searchCaption").textContent =
        `${results.length} results found`;
    }

    navigate("search");
  }

  function openStory(storyId) {
    const story = stories.find(
      item => item.id === storyId
    );

    if (!story) return;

    currentStory = story;

    readingHistory = [
      storyId,
      ...readingHistory.filter(id => id !== storyId)
    ].slice(0, 20);

    saveStorage("arix-history", readingHistory);

    const reader = $("readerContent");

    if (reader) {
      reader.innerHTML = `
        <div class="reader-cover">

          <div class="cover-art"
            style="--cover-bg:${story.bg};
                   --cover-glow:${story.glow}">

            <span class="cover-orb"></span>
            <span class="cover-rune">
              ${escapeHTML(story.rune)}
            </span>
            <span class="cover-title">
              ${escapeHTML(story.title)}
            </span>
            <span class="cover-subtitle">
              ${escapeHTML(story.genre)} · ARIX
            </span>
          </div>

          <div>
            <p class="eyebrow">
              ${escapeHTML(story.type)} ·
              ${escapeHTML(story.genre)}
            </p>

            <h1>${escapeHTML(story.title)}</h1>

            <p>${escapeHTML(story.description)}</p>

            <p>
              ★ ${escapeHTML(story.rating)}
              · Chapter ${escapeHTML(story.chapter)}
            </p>

            <button type="button"
              class="button button-primary"
              id="demoChapterButton">
              Start reading →
            </button>
          </div>
        </div>

        <p class="reader-note">
          This is a sample story preview.
          Actual comic pages and chapters must be uploaded
          before they can be read.
        </p>
      `;

      $("demoChapterButton")?.addEventListener(
        "click",
        () => showToast(
          "Chapter pages have not been uploaded yet."
        )
      );
    }

    updateReaderBookmark();
    navigate("reader");

    renderGrid(
      "continueGrid",
      readingHistory
        .map(id => stories.find(item => item.id === id))
        .filter(Boolean)
        .slice(0, 4)
    );
  }

  function toggleBookmark(storyId) {
    if (bookmarks.includes(storyId)) {
      bookmarks = bookmarks.filter(id => id !== storyId);
      showToast("Removed from your library");
    } else {
      bookmarks.unshift(storyId);
      showToast("Saved to your library");
    }

    saveStorage("arix-bookmarks", bookmarks);

    renderStories();
    updateReaderBookmark();
  }

  function updateReaderBookmark() {
    const button = $("readerBookmark");

    if (!button || !currentStory) return;

    button.textContent = bookmarks.includes(currentStory.id)
      ? "★ Saved"
      : "☆ Save";
  }

  document.addEventListener("click", event => {
    const bookmarkButton = event.target.closest(
      "[data-bookmark]"
    );

    if (bookmarkButton) {
      event.stopPropagation();
      toggleBookmark(bookmarkButton.dataset.bookmark);
      return;
    }

    const storyCard = event.target.closest(
      "[data-open-story]"
    );

    if (storyCard) {
      openStory(storyCard.dataset.openStory);
      return;
    }

    const navButton = event.target.closest("[data-nav]");

    if (navButton) {
      event.preventDefault();
      navigate(navButton.dataset.nav);
      return;
    }

    const filterButton = event.target.closest("[data-filter]");

    if (filterButton) {
      activeFilter = filterButton.dataset.filter;

      document.querySelectorAll("[data-filter]").forEach(button => {
        button.classList.toggle(
          "selected",
          button.dataset.filter === activeFilter
        );
      });

      renderGrid(
        "discoverGrid",
        stories.filter(story =>
          activeFilter === "All" ||
          story.type === activeFilter
        )
      );

      return;
    }

    const genreButton = event.target.closest("[data-genre]");

    if (genreButton) {
      const genre = genreButton.dataset.genre;

      renderGrid(
        "genreResults",
        stories.filter(story => story.genre === genre),
        "No stories in this genre",
        "More stories can be added later."
      );

      if ($("genreResultsTitle")) {
        $("genreResultsTitle").textContent = genre;
      }

      navigate("genres");
    }
  });

  document.addEventListener("keydown", event => {
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.matches("[data-open-story]")
    ) {
      event.preventDefault();
      openStory(event.target.dataset.openStory);
    }
  });

  $("searchInput")?.addEventListener(
    "input",
    searchStories
  );

  $("profileButton")?.addEventListener(
    "click",
    () => navigate("profile")
  );

  $("mobileHome")?.addEventListener(
    "click",
    () => navigate("home")
  );

  $("readerBack")?.addEventListener(
    "click",
    () => navigate("home")
  );

  $("readerBookmark")?.addEventListener(
    "click",
    () => {
      if (currentStory) {
        toggleBookmark(currentStory.id);
      }
    }
  );

  $("themeButton")?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    saveStorage(
      "arix-light-mode",
      document.body.classList.contains("light-mode")
    );
  });

  $("clearHistory")?.addEventListener("click", () => {
    readingHistory = [];

    saveStorage("arix-history", readingHistory);

    renderStories();

    showToast("Reading history cleared");
  });

  /* Keep the logo-only intro, then reveal the website. */
  const reduceIntro = readStorage(
    "arix-reduce-intro",
    false
  );

  if (reduceIntro) {
    $("intro")?.classList.add("done");
    $("app")?.classList.add("ready");
  } else {
    setTimeout(() => {
      $("intro")?.classList.add("done");
      $("app")?.classList.add("ready");
    }, 1650);
  }

  renderStories();

  const initialView = location.hash.replace("#", "");

  navigate(initialView || "home");

  window.addEventListener("hashchange", () => {
    const view = location.hash.replace("#", "");
    navigate(view || "home");
  });
})();
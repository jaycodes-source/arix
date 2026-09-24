/* =========================================================
   ARIX — COMIC / NOVEL READING APP
   Main JavaScript
   ========================================================= */

"use strict";

/* =========================================================
   ARIX APP CONFIG
   ========================================================= */

const ARIX_CONFIG = {
    introDuration: 4200,
    storagePrefix: "arix_"
};


/* =========================================================
   STORAGE HELPERS
   ========================================================= */

const storage = {
    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(ARIX_CONFIG.storagePrefix + key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(
                ARIX_CONFIG.storagePrefix + key,
                JSON.stringify(value)
            );
        } catch {
            console.warn("ARIX: Could not save data.");
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(ARIX_CONFIG.storagePrefix + key);
        } catch {
            // Ignore storage errors
        }
    }
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */

function showToast(message, type = "normal") {
    let toast = $(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


/* =========================================================
   OPENING EXPERIENCE
   ========================================================= */

function initIntro() {
    const intro = $("#intro");

    if (!intro) return;

    const introSeen = sessionStorage.getItem("arix_intro_seen");
    const skipButton = $(".intro-skip", intro);

    // Respect reduced-motion settings.
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (introSeen || reducedMotion) {
        intro.classList.add("intro-hidden");
        document.body.classList.remove("intro-active");
        return;
    }

    document.body.classList.add("intro-active");

    let finished = false;

    const finishIntro = () => {
        if (finished) return;

        finished = true;

        intro.classList.add("intro-exit");

        sessionStorage.setItem("arix_intro_seen", "true");

        setTimeout(() => {
            intro.classList.add("intro-hidden");
            document.body.classList.remove("intro-active");
        }, 700);
    };

    if (skipButton) {
        skipButton.addEventListener("click", finishIntro);
    }

    setTimeout(finishIntro, ARIX_CONFIG.introDuration);
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {
    const menuButton = $(".mobile-menu-btn");
    const mobileMenu = $(".mobile-menu");

    if (!menuButton || !mobileMenu) return;

    menuButton.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("open");

        menuButton.classList.toggle("active", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    $$(".nav-link", mobileMenu).forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("open");
            menuButton.classList.remove("active");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });
}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

function initNavigation() {
    $$("[data-scroll]").forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();

            const targetID = button.dataset.scroll;
            const target = document.getElementById(targetID);

            if (!target) return;

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    $$('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetID = link.getAttribute("href");

            if (!targetID || targetID === "#") return;

            const target = document.querySelector(targetID);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}


/* =========================================================
   SEARCH
   ========================================================= */

function initSearch() {
    const searchInput = $(".search-box input");

    if (!searchInput) return;

    const cards = $$(".story-card");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value
            .trim()
            .toLowerCase();

        let visibleCount = 0;

        cards.forEach(card => {
            const title =
                $(".story-title", card)?.textContent.toLowerCase() || "";

            const meta =
                $(".story-meta", card)?.textContent.toLowerCase() || "";

            const matches =
                title.includes(query) ||
                meta.includes(query);

            card.style.display = matches ? "" : "none";

            if (matches) visibleCount++;
        });

        updateSearchMessage(query, visibleCount);
    });
}


function updateSearchMessage(query, count) {
    let message = $(".search-result-message");

    if (!query) {
        if (message) message.remove();
        return;
    }

    if (!message) {
        message = document.createElement("p");
        message.className = "search-result-message";

        const searchSection = $(".search-section");

        if (searchSection) {
            searchSection.appendChild(message);
        }
    }

    if (message) {
        message.textContent =
            count === 0
                ? "No stories found."
                : `${count} ${count === 1 ? "story" : "stories"} found.`;
    }
}


/* =========================================================
   STORY FILTERS
   ========================================================= */

function initStoryFilters() {
    const filterButtons = $$("[data-genre]");

    if (!filterButtons.length) return;

    const cards = $$(".story-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const genre = button.dataset.genre?.toLowerCase();

            filterButtons.forEach(item =>
                item.classList.remove("active")
            );

            button.classList.add("active");

            cards.forEach(card => {
                if (!genre || genre === "all") {
                    card.style.display = "";
                    return;
                }

                const cardGenre =
                    card.dataset.genre?.toLowerCase() || "";

                card.style.display =
                    cardGenre === genre ? "" : "none";
            });
        });
    });
}


/* =========================================================
   THEME SWITCHER
   ========================================================= */

function initTheme() {
    const themeButton =
        $("#themeToggle") ||
        $('[data-action="theme"]');

    if (!themeButton) return;

    const savedTheme = storage.get("theme", "dark");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }

    updateThemeButton(themeButton);

    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");

        const lightMode =
            document.body.classList.contains("light-theme");

        storage.set("theme", lightMode ? "light" : "dark");

        updateThemeButton(themeButton);
    });
}


function updateThemeButton(button) {
    const lightMode =
        document.body.classList.contains("light-theme");

    button.setAttribute(
        "aria-label",
        lightMode
            ? "Switch to dark mode"
            : "Switch to light mode"
    );
}


/* =========================================================
   PROFILE PANEL
   ========================================================= */

function initProfilePanel() {
    const profileButton =
        $(".profile-chip") ||
        $('[data-action="profile"]');

    const panel = $(".profile-panel");

    if (!profileButton || !panel) return;

    const closeButton =
        $(".close-btn", panel) ||
        $('[data-action="close-profile"]', panel);

    const openPanel = () => {
        panel.classList.add("open");
        document.body.classList.add("panel-open");
    };

    const closePanel = () => {
        panel.classList.remove("open");
        document.body.classList.remove("panel-open");
    };

    profileButton.addEventListener("click", openPanel);

    if (closeButton) {
        closeButton.addEventListener("click", closePanel);
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closePanel();
        }
    });
}


/* =========================================================
   BOOKMARK SYSTEM
   ========================================================= */

function initBookmarks() {
    const buttons = $$(
        '[data-action="bookmark"], .bookmark-btn'
    );

    if (!buttons.length) return;

    const bookmarks = storage.get("bookmarks", []);

    buttons.forEach(button => {
        const storyID =
            button.dataset.storyId ||
            button.closest(".story-card")?.dataset.storyId;

        if (!storyID) return;

        if (bookmarks.includes(storyID)) {
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
        }

        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const current = storage.get("bookmarks", []);
            const index = current.indexOf(storyID);

            if (index === -1) {
                current.push(storyID);

                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");

                showToast("Added to your library.");
            } else {
                current.splice(index, 1);

                button.classList.remove("active");
                button.setAttribute("aria-pressed", "false");

                showToast("Removed from your library.");
            }

            storage.set("bookmarks", current);
        });
    });
}


/* =========================================================
   LIKE / DISLIKE
   ========================================================= */

function initReactions() {
    $$('[data-action="like"]').forEach(button => {
        button.addEventListener("click", () => {
            const storyID =
                button.dataset.storyId || "default";

            storage.set(`like_${storyID}`, true);

            button.classList.add("active");

            showToast("Story liked.");
        });
    });

    $$('[data-action="dislike"]').forEach(button => {
        button.addEventListener("click", () => {
            const storyID =
                button.dataset.storyId || "default";

            storage.set(`dislike_${storyID}`, true);

            button.classList.add("active");

            showToast("Feedback saved.");
        });
    });
}


/* =========================================================
   READER MODAL
   ========================================================= */

let readerState = {
    currentPage: 1,
    totalPages: 1,
    zoom: 1,
    storyID: "default"
};


function initReader() {
    const modal = $(".reader-modal");

    if (!modal)
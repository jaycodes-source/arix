/* =========================================================
   ARIX — STORY DATABASE
   Temporary frontend data
   Backend/database will replace this later.
========================================================= */

const ARIX_STORIES = [
  {
    id: "story-001",
    title: "Beyond the Last Horizon",
    type: "Comic",
    genre: "Adventure",
    status: "Ongoing",
    author: "ARIX Studio",
    rating: 4.8,
    chapters: 12,
    description:
      "A young traveler enters an unknown world where every horizon hides another secret.",
    cover: "",
    pages: [],
    featured: true
  },

  {
    id: "story-002",
    title: "Echoes of the Moon",
    type: "Novel",
    genre: "Fantasy",
    status: "Ongoing",
    author: "ARIX Studio",
    rating: 4.9,
    chapters: 18,
    description:
      "A mysterious power awakens beneath an ancient city and changes one ordinary life forever.",
    cover: "",
    pages: [],
    featured: true
  },

  {
    id: "story-003",
    title: "Zero Point",
    type: "Comic",
    genre: "Action",
    status: "New",
    author: "ARIX Studio",
    rating: 4.7,
    chapters: 7,
    description:
      "When everything begins at zero, becoming the strongest means discovering what zero really means.",
    cover: "",
    pages: [],
    featured: true
  },

  {
    id: "story-004",
    title: "Letters Never Sent",
    type: "Novel",
    genre: "Romance",
    status: "Completed",
    author: "ARIX Studio",
    rating: 4.6,
    chapters: 24,
    description:
      "Two people separated by time discover a collection of letters that was never meant to be found.",
    cover: "",
    pages: [],
    featured: true
  },

  {
    id: "story-005",
    title: "The Hidden Realm",
    type: "Comic",
    genre: "Fantasy",
    status: "Ongoing",
    author: "ARIX Studio",
    rating: 4.8,
    chapters: 15,
    description:
      "A forgotten gateway leads to a realm where ancient forces are beginning to return.",
    cover: "",
    pages: [],
    featured: false
  },

  {
    id: "story-006",
    title: "Night Signal",
    type: "Comic",
    genre: "Mystery",
    status: "New",
    author: "ARIX Studio",
    rating: 4.5,
    chapters: 5,
    description:
      "A strange signal appears every night, leading a group of friends toward an impossible mystery.",
    cover: "",
    pages: [],
    featured: false
  },

  {
    id: "story-007",
    title: "Starlight Protocol",
    type: "Novel",
    genre: "Sci-Fi",
    status: "Ongoing",
    author: "ARIX Studio",
    rating: 4.7,
    chapters: 21,
    description:
      "Humanity's last communication system receives a message from somewhere beyond the stars.",
    cover: "",
    pages: [],
    featured: false
  },

  {
    id: "story-008",
    title: "Road of Kings",
    type: "Comic",
    genre: "Action",
    status: "Ongoing",
    author: "ARIX Studio",
    rating: 4.9,
    chapters: 20,
    description:
      "A determined fighter begins a journey that will put every rule of the world to the test.",
    cover: "",
    pages: [],
    featured: false
  }
];


/* =========================================================
   STORY HELPERS
========================================================= */

function getStoryById(id) {
  return ARIX_STORIES.find(story => story.id === id) || null;
}


function getStoriesByGenre(genre) {
  return ARIX_STORIES.filter(
    story => story.genre.toLowerCase() === genre.toLowerCase()
  );
}


function searchStories(query) {
  const search = query.trim().toLowerCase();

  if (!search) {
    return ARIX_STORIES;
  }

  return ARIX_STORIES.filter(story => {
    return (
      story.title.toLowerCase().includes(search) ||
      story.genre.toLowerCase().includes(search) ||
      story.type.toLowerCase().includes(search) ||
      story.author.toLowerCase().includes(search)
    );
  });
}


function getFeaturedStories() {
  return ARIX_STORIES.filter(story => story.featured);
}


/* =========================================================
   STORAGE KEYS
========================================================= */

const ARIX_STORAGE_KEYS = {
  bookmarks: "arix_bookmarks",
  history: "arix_reading_history",
  reactions: "arix_reactions",
  profile: "arix_profile",
  theme: "arix_theme",
  lastPage: "arix_last_page"
};


/* =========================================================
   SAFE LOCAL STORAGE
========================================================= */

function arixGetStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);

  } catch (error) {
    console.warn("ARIX storage read error:", error);
    return fallback;
  }
}


function arixSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;

  } catch (error) {
    console.warn("ARIX storage write error:", error);
    return false;
  }
}


/* =========================================================
   BOOKMARKS
========================================================= */

function getBookmarks() {
  return arixGetStorage(
    ARIX_STORAGE_KEYS.bookmarks,
    []
  );
}


function isBookmarked(storyId) {
  return getBookmarks().includes(storyId);
}


function toggleBookmark(storyId) {
  const bookmarks = getBookmarks();

  const index = bookmarks.indexOf(storyId);

  if (index === -1) {
    bookmarks.push(storyId);
  } else {
    bookmarks.splice(index, 1);
  }

  arixSetStorage(
    ARIX_STORAGE_KEYS.bookmarks,
    bookmarks
  );

  return bookmarks.includes(storyId);
}


/* =========================================================
   READING HISTORY
========================================================= */

function getReadingHistory() {
  return arixGetStorage(
    ARIX_STORAGE_KEYS.history,
    []
  );
}


function saveReadingProgress(storyId, page = 1) {
  const history = getReadingHistory();

  const existingIndex = history.findIndex(
    item => item.storyId === storyId
  );

  const entry = {
    storyId,
    page,
    updatedAt: Date.now()
  };

  if (existingIndex !== -1) {
    history[existingIndex] = entry;
  } else {
    history.unshift(entry);
  }

  arixSetStorage(
    ARIX_STORAGE_KEYS.history,
    history.slice(0, 30)
  );

  arixSetStorage(
    `${ARIX_STORAGE_KEYS.lastPage}_${storyId}`,
    page
  );
}


function getStoryProgress(storyId) {
  const history = getReadingHistory();

  const entry = history.find(
    item => item.storyId === storyId
  );

  return entry ? entry.page : 1;
}


/* =========================================================
   REACTIONS
========================================================= */

function getReactions() {
  return arixGetStorage(
    ARIX_STORAGE_KEYS.reactions,
    {}
  );
}


function setReaction(storyId, reaction) {
  const reactions = getReactions();

  if (!reaction) {
    delete reactions[storyId];
  } else {
    reactions[storyId] = reaction;
  }

  arixSetStorage(
    ARIX_STORAGE_KEYS.reactions,
    reactions
  );

  return reactions;
}


function getReaction(storyId) {
  const reactions = getReactions();

  return reactions[storyId] || null;
}


/* =========================================================
   PROFILE
========================================================= */

function getProfile() {
  return arixGetStorage(
    ARIX_STORAGE_KEYS.profile,
    {
      name: "Reader",
      email: "Welcome to ARIX.",
      avatar: "J"
    }
  );
}


function saveProfile(profile) {
  arixSetStorage(
    ARIX_STORAGE_KEYS.profile,
    profile
  );
}


/* =========================================================
   STORY PAGE DATA
========================================================= */

/*
  Real comic pages will eventually come from the
  ARIX storage/backend system.

  Example:

  pages: [
    "assets/stories/story-001/chapter-1/page-01.jpg",
    "assets/stories/story-001/chapter-1/page-02.jpg"
  ]
*/

function getStoryPages(storyId) {
  const story = getStoryById(storyId);

  if (!story) {
    return [];
  }

  return Array.isArray(story.pages)
    ? story.pages
    : [];
}


/* =========================================================
   EXPORT-LIKE GLOBAL
========================================================= */

window.ARIX = {
  stories: ARIX_STORIES,

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
  saveProfile,

  getStoryPages,

  storageKeys: ARIX_STORAGE_KEYS
};
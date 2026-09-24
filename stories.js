/* ==========================================
   ARIX STORY DATABASE
========================================== */

const ARIX_STORIES = [

    {
        id: "the-last-arcane",

        title: "The Last Arcane",

        type: "Comic",

        genres: [
            "Action",
            "Fantasy",
            "Magic"
        ],

        status: "Ongoing",

        author: "ARIX Studio",

        cover: "assets/covers/the-last-arcane.jpg",

        description:
            "A mysterious young mage discovers a forbidden power that could change the entire magical world.",

        rating: 4.8,

        featured: true,

        chapters: [
            {
                number: 1,
                title: "The Awakening",

                pages: [
                    "assets/comics/the-last-arcane/chapter-1/page-01.jpg",
                    "assets/comics/the-last-arcane/chapter-1/page-02.jpg",
                    "assets/comics/the-last-arcane/chapter-1/page-03.jpg"
                ]
            },

            {
                number: 2,
                title: "The Hidden Power",

                pages: [
                    "assets/comics/the-last-arcane/chapter-2/page-01.jpg",
                    "assets/comics/the-last-arcane/chapter-2/page-02.jpg",
                    "assets/comics/the-last-arcane/chapter-2/page-03.jpg"
                ]
            }
        ]
    },


    {
        id: "moonlight-academy",

        title: "Moonlight Academy",

        type: "Novel",

        genres: [
            "Romance",
            "Fantasy",
            "School"
        ],

        status: "Ongoing",

        author: "ARIX Studio",

        cover: "assets/covers/moonlight-academy.jpg",

        description:
            "A new student enters a mysterious academy where magic, friendship and unexpected feelings collide.",

        rating: 4.6,

        featured: true,

        chapters: [
            {
                number: 1,
                title: "The New Student",

                pages: []
            },

            {
                number: 2,
                title: "The Secret",

                pages: []
            }
        ]
    },


    {
        id: "shadow-reborn",

        title: "Shadow Reborn",

        type: "Comic",

        genres: [
            "Action",
            "Adventure",
            "Fantasy"
        ],

        status: "Completed",

        author: "ARIX Studio",

        cover: "assets/covers/shadow-reborn.jpg",

        description:
            "After losing everything, a mysterious warrior returns with a power nobody understands.",

        rating: 4.9,

        featured: true,

        chapters: [
            {
                number: 1,
                title: "Rebirth",

                pages: [
                    "assets/comics/shadow-reborn/chapter-1/page-01.jpg",
                    "assets/comics/shadow-reborn/chapter-1/page-02.jpg"
                ]
            },

            {
                number: 2,
                title: "The First Battle",

                pages: [
                    "assets/comics/shadow-reborn/chapter-2/page-01.jpg",
                    "assets/comics/shadow-reborn/chapter-2/page-02.jpg"
                ]
            }
        ]
    },


    {
        id: "beyond-the-stars",

        title: "Beyond the Stars",

        type: "Novel",

        genres: [
            "Adventure",
            "Fantasy",
            "Mystery"
        ],

        status: "Ongoing",

        author: "ARIX Studio",

        cover: "assets/covers/beyond-the-stars.jpg",

        description:
            "A mysterious message from the stars begins an adventure beyond the known world.",

        rating: 4.7,

        featured: false,

        chapters: [
            {
                number: 1,
                title: "The Message",

                pages: []
            },

            {
                number: 2,
                title: "Unknown Territory",

                pages: []
            }
        ]
    }

];


/* ==========================================
   STORY FUNCTIONS
========================================== */

function getAllStories() {
    return ARIX_STORIES;
}


function getStoryById(id) {

    return ARIX_STORIES.find(
        story => story.id === id
    );

}


function searchStories(query) {

    const searchTerm = query
        .toLowerCase()
        .trim();

    if (!searchTerm) {
        return ARIX_STORIES;
    }

    return ARIX_STORIES.filter(story => {

        const titleMatch =
            story.title
                .toLowerCase()
                .includes(searchTerm);

        const genreMatch =
            story.genres.some(genre =>
                genre
                    .toLowerCase()
                    .includes(searchTerm)
            );

        const typeMatch =
            story.type
                .toLowerCase()
                .includes(searchTerm);

        return (
            titleMatch ||
            genreMatch ||
            typeMatch
        );

    });

}


function getStoriesByGenre(genre) {

    return ARIX_STORIES.filter(story =>
        story.genres.some(
            item =>
                item.toLowerCase() ===
                genre.toLowerCase()
        )
    );

}


function getFeaturedStories() {

    return ARIX_STORIES.filter(
        story => story.featured
    );

}


function getChapters(storyId) {

    const story = getStoryById(storyId);

    if (!story) {
        return [];
    }

    return story.chapters;

}


function getChapter(storyId, chapterNumber) {

    const story = getStoryById(storyId);

    if (!story) {
        return null;
    }

    return story.chapters.find(
        chapter =>
            chapter.number ===
            Number(chapterNumber)
    );

}


function getAllGenres() {

    const genres = new Set();

    ARIX_STORIES.forEach(story => {

        story.genres.forEach(genre => {
            genres.add(genre);
        });

    });

    return Array.from(genres).sort();

}


/* ==========================================
   ARIX GLOBAL SYSTEM
========================================== */

window.ARIX = window.ARIX || {};

window.ARIX.stories = ARIX_STORIES;

window.ARIX.getAllStories =
    getAllStories;

window.ARIX.getStoryById =
    getStoryById;

window.ARIX.searchStories =
    searchStories;

window.ARIX.getStoriesByGenre =
    getStoriesByGenre;

window.ARIX.getFeaturedStories =
    getFeaturedStories;

window.ARIX.getChapters =
    getChapters;

window.ARIX.getChapter =
    getChapter;

window.ARIX.getAllGenres =
    getAllGenres;
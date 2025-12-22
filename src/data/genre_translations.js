export const GENRE_TRANSLATIONS = {
    "Action": "Action",
    "Adventure": "Aventure",
    "Avant Garde": "Avant-Garde",
    "Award Winning": "Primé",
    "Boys Love": "Boys Love",
    "Comedy": "Comédie",
    "Drama": "Drame",
    "Fantasy": "Fantasy",
    "Girls Love": "Girls Love",
    "Gourmet": "Gourmet",
    "Horror": "Horreur",
    "Mystery": "Mystère",
    "Romance": "Romance",
    "Sci-Fi": "Science-Fiction",
    "Slice of Life": "Tranche de vie",
    "Sports": "Sports",
    "Supernatural": "Surnaturel",
    "Suspense": "Suspense",
    "Ecchi": "Ecchi",
    "Erotica": "Érotique",
    "Hentai": "Hentai",
    "Cars": "Voitures",
    "Demons": "Démons",
    "Game": "Jeu",
    "Historical": "Historique",
    "Kids": "Enfants",
    "Magic": "Magie",
    "Martial Arts": "Arts Martiaux",
    "Mecha": "Mecha",
    "Music": "Musique",
    "Parody": "Parodie",
    "Samurai": "Samouraï",
    "School": "École",
    "Space": "Espace",
    "Super Power": "Super Pouvoir",
    "Vampire": "Vampire",
    "Harem": "Harem",
    "Military": "Militaire",
    "Police": "Police",
    "Psychological": "Psychologique",
    "Thriller": "Thriller",
    "Seinen": "Seinen",
    "Josei": "Josei",
    "Shounen": "Shounen",
    "Shoujo": "Shoujo"
};

export const getLocalizedGenre = (genreName, lang) => {
    if (lang === 'fr' && GENRE_TRANSLATIONS[genreName]) {
        return GENRE_TRANSLATIONS[genreName];
    }
    return genreName;
};

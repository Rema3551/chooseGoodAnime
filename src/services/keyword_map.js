
export const KEYWORD_TO_TAG = {
    // --- 1. Émotions & Tonalité (Emotions & Tone) ---
    // Positif / Joyeux
    'joyeux': 'Iyashikei',
    'heureux': 'Iyashikei',
    'bonheur': 'Slice of Life',
    'feel good': 'Iyashikei',
    'feelgood': 'Iyashikei',
    'bienveillant': 'Iyashikei',
    'réconfortant': 'Iyashikei',
    'recomfortant': 'Iyashikei',
    'doux': 'Iyashikei',
    'tendre': 'Romance',
    'mignon': 'Kawaii', // "Kawaii" isn't a standard tag always, but Iyashikei/SoL often fits. Let's map to Slice of Life if Kawaii fails, but 'Cute Girls Doing Cute Things' is a tag? Let's use 'Slice of Life' or 'Comedy' as fallback or specific tags if known. Actually 'Moe' might be better? Let's stick to standard Genres/Tags. 'Iyashikei' is safe.
    'kawaii': 'Iyashikei',
    'adorable': 'Iyashikei',
    'chou': 'Iyashikei',
    'optimiste': 'Sports', // Often sports or adventure
    'espoir': 'Drama',
    'inspirant': 'Sports',

    // Comédie / Amusant
    'drôle': 'Comedy',
    'drole': 'Comedy',
    'marrant': 'Comedy',
    'amusant': 'Comedy',
    'hilarant': 'Comedy',
    'fun': 'Comedy',
    'comique': 'Comedy',
    'rire': 'Comedy',
    'fourire': 'Comedy',
    'parodie': 'Parody',
    'absurde': 'Surreal Comedy',
    'loufoque': 'Surreal Comedy',
    'bizarre': 'Surreal Comedy',
    'barré': 'Surreal Comedy',
    'wtf': 'Surreal Comedy',
    'nimportequoi': 'Surreal Comedy',
    'decale': 'Surreal Comedy',
    'décale': 'Surreal Comedy',
    'décalé': 'Surreal Comedy',

    // Triste / Sombre / Sérieux
    'triste': 'Tragedy',
    'pleurer': 'Tragedy',
    'larmes': 'Tragedy',
    'deprimant': 'Drama',
    'déprimant': 'Drama',
    'sombre': 'Dark Fantasy',
    'dark': 'Dark Fantasy',
    'noir': 'Film Noir', // Rare but exists
    'serieux': 'Drama',
    'sérieux': 'Drama',
    'mature': 'Seinen',
    'adulte': 'Josei',
    'violent': 'Violence', // Tag "Violence" exists? usually "Gore" or "Violence". Let's try 'Seinen' or 'Action' if unsure. AniList has 'Gore'.
    'violence': 'Gore',
    'sanglant': 'Gore',
    'gore': 'Gore',
    'sang': 'Gore',
    'brutal': 'Gore',
    'cruel': 'Psychological',
    'glauque': 'Horror',
    'angoissant': 'Thriller',
    'stressant': 'Thriller',
    'tendu': 'Thriller',
    'suspense': 'Thriller',
    'effrayant': 'Horror',
    'peur': 'Horror',
    'terreur': 'Horror',
    'horreur': 'Horror',
    'flippant': 'Horror',
    'epouvante': 'Horror',
    'épouvante': 'Horror',
    'creepy': 'Horror',
    'maltraitance': 'Drama',
    'deuil': 'Drama',
    'suicide': 'Drama', // Sensitive, but 'Drama' fits

    // Calme / Contemplatif
    'calme': 'Iyashikei',
    'reposant': 'Iyashikei',
    'relaxant': 'Iyashikei',
    'chill': 'Iyashikei',
    'zen': 'Iyashikei',
    'paisible': 'Iyashikei',
    'contemplatif': 'Iyashikei',
    'ennuyeux': 'Slice of Life', // Subjective map
    'lent': 'Slice of Life',
    'slow': 'Slice of Life',
    'poetique': 'Iyashikei',
    'poétique': 'Iyashikei',
    'onirique': 'Fantasy', // Or specific "Dreams" tag? 
    'reve': 'Fantasy',
    'rêve': 'Fantasy',
    'melancolique': 'Drama',
    'mélancolique': 'Drama',
    'nostalgique': 'Iyashikei',

    // Intense / Épique
    'epique': 'Action',
    'épique': 'Action',
    'grandiose': 'Adventure',
    'spectaculaire': 'Action',
    'intense': 'Thriller',
    'rapide': 'Action',
    'dynamique': 'Sports',
    'explosif': 'Action',
    'baston': 'Action',
    'bagarre': 'Action',
    'combat': 'Action',
    'guerre': 'War',
    'militaire': 'Military',
    'armee': 'Military',
    'armée': 'Military',
    'strategie': 'Strategy', // Tag "Strategy"?
    'stratégie': 'Psychological', // Fallback
    'intelligent': 'Psychological',
    'smart': 'Psychological',
    'genie': 'Psychological',
    'génie': 'Psychological',
    'mindgame': 'Psychological',
    'manipulation': 'Psychological',

    // --- 2. Thèmes & Genres (Themes & Genres) ---
    // Fantastique / Surnaturel
    'magie': 'Magic',
    'magique': 'Magic',
    'sorcellerie': 'Magic',
    'sorcier': 'Magic',
    'mage': 'Magic',
    'dragon': 'Dragons',
    'vampire': 'Vampire',
    'loup-garou': 'Werewolf',
    'loup': 'Werewolf',
    'demon': 'Demon',
    'démon': 'Demon',
    'ange': 'Angels', // Tag "Angels"?
    'dieu': 'Gods',
    'divin': 'Gods',
    'esprit': 'Ghost',
    'fantome': 'Ghost',
    'fantôme': 'Ghost',
    'yokai': 'Youkai',
    'monstre': 'Monster',
    'superpouvoir': 'Super Power',
    'pouvoir': 'Super Power',
    'super': 'Super Power',
    'hero': 'Super Power',
    'héros': 'Super Power',

    // Futur / Science
    'futur': 'Sci-Fi',
    'futuriste': 'Sci-Fi',
    'science': 'Sci-Fi',
    'technologie': 'Sci-Fi',
    'robot': 'Mecha',
    'mecha': 'Mecha',
    'android': 'Android', // Tag "Android"?
    'cyborg': 'Cyborg',
    'ia': 'Sci-Fi',
    'espace': 'Space',
    'spatial': 'Space',
    'vaisseau': 'Space',
    'planete': 'Space',
    'planète': 'Space',
    'alien': 'Aliens',
    'extraterrestre': 'Aliens',
    'cyberpunk': 'Cyberpunk',
    'steampunk': 'Steampunk',
    'dystopie': 'Dystopian',
    'apocalypse': 'Post-Apocalyptic',
    'post-apo': 'Post-Apocalyptic',
    'fin du monde': 'Post-Apocalyptic',
    'voyage temporel': 'Time Travel',
    'temps': 'Time Travel',

    // Setting / Lieu
    'ecole': 'School',
    'école': 'School',
    'scolaire': 'School',
    'lycee': 'School',
    'lycée': 'School',
    'college': 'School',
    'collège': 'School',
    'etudiant': 'School',
    'étudiant': 'School',
    'club': 'School Club', // Valid Tag
    'travail': 'Workplace', // Valid Tag
    'bureau': 'Workplace',
    'entreprise': 'Workplace',
    'entreprise': 'Workplace',
    'donjon': 'Dungeon',
    'dungeon': 'Dungeon',
    'donjons': 'Dungeon', // Direct plural mapping for safety
    'tour': 'Tower',
    'tower': 'Tower',
    'monde': 'Fantasy', // Generic
    'isekai': 'Isekai',
    'reincarnation': 'Reincarnation',
    'historique': 'Historical',
    'histoire': 'Historical',
    'amurai': 'Samurai', // Typo fix
    'samourai': 'Samurai',
    'samurai': 'Samurai',
    'ninja': 'Ninja',
    'moyen-age': 'Medieval', // Tag "Medieval"? Usually just Fantasy/Historical
    'medieval': 'Fantasy',
    'chateau': 'Fantasy',
    'roi': 'Fantasy',
    'reine': 'Fantasy',
    'princesse': 'Fantasy',
    'chevalier': 'Fantasy',

    // Romance / Relations
    'amour': 'Romance',
    'love': 'Romance',
    'romantique': 'Romance',
    'couple': 'Romance',
    'mariage': 'Romance',
    'triangle': 'Love Triangle',
    'amitie': 'Friendship', // Tag "Friendship"? Usually SoL
    'amitié': 'Slice of Life',
    'potes': 'Slice of Life',
    'harem': 'Harem',
    'polygamie': 'Harem',
    'inverse': 'Reverse Harem',
    'beau': 'Romance', // Valid mapping
    'beaugosse': 'Shoujo', // Verified mapping
    'bg': 'Shoujo',
    'bishonen': 'Shoujo',
    'bl': 'Boys Love',
    'yaoi': 'Boys Love',
    'gay': 'Boys Love',
    'gl': 'Yuri',
    'yuri': 'Yuri',
    'lesbienne': 'Yuri',
    'shoujo-ai': 'Yuri',
    'shounen-ai': 'Boys Love',
    'sexy': 'Ecchi',
    'ecchi': 'Ecchi',
    'chaud': 'Ecchi',
    'nu': 'Ecchi',
    'fansevice': 'Ecchi',
    'fanservice': 'Ecchi',

    // --- 3. Personnages & Archetypes ---
    'badass': 'Super Power', // Often correlated
    'surpuissant': 'Super Power',
    'faible': 'Weak to Strong', // Tag? "Weak to Strong" exists in manhwa context, maybe "Growth"?
    'evolution': 'Coming of Age',
    'grandir': 'Coming of Age',
    'enfant': 'Kids',
    'shota': 'Comedy', // Often comedy/slice of life, risky tag
    'loli': 'Comedy',
    'tsundere': 'Tsundere', // Tag exists
    'yandere': 'Yandere', // Tag exists
    'kuudere': 'Kuudere',
    'maider': 'Maids', // Typo
    'maid': 'Maids',
    'majordome': 'Butler',
    'servante': 'Maids',
    'delinquant': 'Delinquents',
    'racaille': 'Delinquents',
    'gang': 'Gangs',
    'yakuza': 'Yakuza',
    'mafia': 'Mafia',
    'detective': 'Detective',
    'inspecteur': 'Detective',
    'police': 'Police',
    'criminel': 'Crime', // Genre?
    'crime': 'Action', // Fallback
    'voleur': 'Thievery', // Tag? "Phantom Thief"?
    'pirate': 'Pirates',
    'idole': 'Idols',
    'idol': 'Idols',
    'chanteuse': 'Music',
    'musique': 'Music',
    'groupe': 'Music',
    'rock': 'Music',
    'sport': 'Sports',
    'football': 'Team Sports', // Tag "Football"? "Soccer"?
    'foot': 'Team Sports',
    'basket': 'Team Sports',
    'tournoi': 'Tournament', // Tag exists
    'competition': 'Sports',

    // --- 4. Spécifique / Vrac ---
    'jeudesociete': 'Board Game',
    'societe': 'Board Game',
    'plateau': 'Board Game',
    'echecs': 'Board Game',
    'shogi': 'Board Game',
    'go': 'Board Game',
    'mahjong': 'Mahjong',
    'esport': 'Video Games',
    'jeu': 'Video Games', // Fixed from "Game"
    'jeux': 'Video Games', // Fixed from "Game"
    'gaming': 'Video Games',
    'mmo': 'Video Games',
    'mmorpg': 'Video Games',
    'rpg': 'Video Games',
    'virtuel': 'Virtual World',
    'paris': 'Gambling',
    'argent': 'Gambling',
    'casino': 'Gambling',
    'vro': 'Cars',
    'voiture': 'Cars',
    'course': 'Cars', // or Racing
    'cuisine': 'Food',
    'bouffe': 'Food',
    'manger': 'Food',
    'gourmet': 'Gourmet',
    'animaux': 'Animals', // Tag?
    'chien': 'Animals',
    'chat': 'Animals',
    'agriculture': 'Agriculture', // Tag available? "Silver Spoon"
    'ferme': 'Agriculture',
    'campagne': 'Iyashikei', // Rural
    'nature': 'Iyashikei',
    'voyage': 'Adventure',
    'aventure': 'Adventure',
    'excursion': 'Adventure',
    'famille': 'Family Life', // Tag
    'family': 'Family Life',

    // Cultes
    'culte': 'Cult',
    'classique': 'Classic', // Tag?
    'chef d\'oeuvre': 'Popular',
    'populaire': 'Popular',
    'connu': 'Popular',
    'masterpiece': 'Popular',
    'sous-cote': 'Underground', // Approx
    'ag': 'Avant Garde',
    'experimental': 'Avant Garde',
    'etrange': 'Avant Garde'
};

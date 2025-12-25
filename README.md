# 🌟 ChooseGoodAnime

Le guide ultime pour trouver votre prochain anime préféré. Une application moderne, fluide et esthétique conçue pour les fans d'animation japonaise.

## ✨ Fonctionnalités Principales

*   **🔍 Recherche Puissante** : 
    *   Par titre (ex: "Naruto")
    *   Par **Ambiance/Vibe** (ex: "Héros surpuissant dans un donjon") grâce à l'intégration d'AniList.
    *   Par **Similarité** (ex: "Comme Attack on Titan").
*   **🧪 Anime Mixer** : Fusionnez deux animes (ex: "Naruto" + "Death Note") pour trouver l'hybride parfait et des recommandations uniques.
*   **🏆 Tier List Maker** : Créez vos propres classements par glisser-déposer avec une banque d'animes dynamique.
*   **🎯 Filtres Avancés** : Plateformes (Netflix, Crunchyroll...), Genres, Année, Statut, Format.
*   **🎲 Mode Surprise** : Laissez le hasard décider avec des critères intelligents.
*   **🌍 Internationalisation** : Interface disponible en Français (FR) et Anglais (EN).
*   **🎨 Thèmes Visuels** : 
    *   🌑 Midnight (Défaut)
    *   ☀️ Daylight
    *   🤖 Cyberpunk
    *   🎋 Zen
    *   🍭 Pop
*   **📱 Responsive & Moderne** : Design fluide, animations soignées, et adapté à tous les écrans.

## 🛠️ Stack Technique

*   **Frontend** : [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling** : CSS Modules / Variables CSS (Pas de framework lourd, performance maximale).
*   **Libraries** : 
    *   [Lucide React](https://lucide.dev/) (Icônes)
    *   [@dnd-kit](https://dndkit.com/) (Drag & Drop)
    *   [Framer Motion](https://www.framer.com/motion/) (Animations)
*   **API** : 
    *   [Jikan API](https://jikan.moe/) (Données MyAnimeList)
    *   [AniList GraphQL](https://anilist.co/home) (Recherche par tags)

## 🚀 Installation & Lancement

1.  **Prérequis** : Assurez-vous d'avoir [Node.js](https://nodejs.org/) (v18+) installé.
2.  **Cloner & Installer** :
    ```bash
    git clone <votre-repo>
    cd chooseGoodAnime
    npm install
    ```
3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
4.  Consultez le site sur `http://localhost:5173`

## 🔮 Roadmap (Idées Futures)

*   🔥 **Mode "Match"** : Interface de swipe type Tinder pour découvrir des animes.
*   🌳 **Arbre d'Évolution** : Visualisation des recommandations sous forme d'arbre de compétences.
*   👤 **Système de Compte** : Sauvegarde des favoris et "Watchlist" locale (en cours).

---
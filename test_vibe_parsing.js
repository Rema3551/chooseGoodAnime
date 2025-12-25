
import { KEYWORD_TO_TAG } from './src/services/keyword_map.js';

function parseQuery(descriptionQuery) {
    // Pre-processing for phrases (convert to single tokens)
    let processedQuery = descriptionQuery.toLowerCase();
    processedQuery = processedQuery.replace(/beau gosse/g, "beaugosse");
    processedQuery = processedQuery.replace(/jeux? de sociét[ée]/g, "jeudesociete");
    processedQuery = processedQuery.replace(/feel good/g, "iyashikei");
    processedQuery = processedQuery.replace(/school life/g, "school");

    // Normalize accents: "Drôle" -> "drole", "Épique" -> "epique"
    const normalizedQuery = processedQuery
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Split by spaces and common punctuation
    const words = normalizedQuery.split(/[\s,.;:!?]+/);
    const tags = [];

    words.forEach(w => {
        // Remove remaining special chars just in case
        const cleanWord = w.replace(/[^a-z0-9-]/g, "");

        if (KEYWORD_TO_TAG[cleanWord]) {
            tags.push(KEYWORD_TO_TAG[cleanWord]);
        } else if (cleanWord.endsWith('s') && KEYWORD_TO_TAG[cleanWord.slice(0, -1)]) {
            tags.push(KEYWORD_TO_TAG[cleanWord.slice(0, -1)]);
        } else if (cleanWord.endsWith('x') && KEYWORD_TO_TAG[cleanWord.slice(0, -1)]) {
            tags.push(KEYWORD_TO_TAG[cleanWord.slice(0, -1)]);
        }
    });

    return [...new Set(tags)];
}

const queries = [
    "beau gosse",
    "beau",
    "bg",
    "personnage surpuissant",
    "drôle et triste",
    "combat épique",
    "isekai avec magie",
    "romance scolaire",
    "personnage beau dans un anime avec des donjons", // User query
    "histoires tristes", // Plural s
    "combats épiques", // Plural s + accent
    "personnages beaux", // Plural x
    "des jeux vidéos", // Plural x
    "jeux de société" // New specific phrase
];

console.log("Testing Vibe Parsing:");
queries.forEach(q => {
    console.log(`"${q}" ->`, parseQuery(q));
});

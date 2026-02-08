import { CohereClient } from "cohere-ai";
import * as cheerio from "cheerio";

// Initialize Cohere Client
if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is missing from environment variables.");
}

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

/**
 * 1. FETCH & CHUNK
 * Fetches text from a URL and breaks it into chunks.
 */
// Reusable chunking logic
export function chunkText(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * 1. FETCH & CHUNK
 * Fetches text from a URL and breaks it into chunks.
 */
export async function fetchAndChunk(url: string) {
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and boilerplate
    $("script, style, nav, footer, header").remove();

    // Get clean text
    const text = $("body").text().replace(/\s+/g, " ").trim();

    const chunks = chunkText(text);

    console.log(`Created ${chunks.length} chunks.`);
    return chunks;
}

/**
 * 2. RERANK (The "Secret Sauce")
 * Instead of just embeddings (which are fast but sometimes fuzzy),
 * we use Cohere's Rerank model to rigorously score the relevance 
 * of each chunk to the user's question.
 */
export async function findBestChunks(query: string, chunks: string[]) {
    console.log("Reranking chunks...");

    const rerankResponse = await cohere.rerank({
        model: "rerank-english-v3.0",
        query: query,
        documents: chunks.map(chunk => ({ text: chunk })),
        topN: 3, // We only want the top 3 most relevant chunks
    });

    const validResults = rerankResponse.results.filter(
        (result) => result.relevanceScore > 0.5 // Filter out low quality matches
    );

    return validResults.map((result) => chunks[result.index]);
}

/**
 * 3. GENERATE WITH CITATIONS
 * Uses Command R+ to answer the question based *only* on the provided chunks.
 */
export async function generateAnswer(query: string, contextChunks: string[]) {
    console.log("Generating answer with Command R+...");

    // Convert chunks to the format Command R+ expects for "documents"
    const documents = contextChunks.map((chunk, index) => ({
        id: `chunk_${index}`,
        text: chunk,
    }));

    const response = await cohere.chat({
        model: "command-r-plus",
        message: query,
        documents: documents,
        temperature: 0.3, // Low temperature for more factual answers
        promptTruncation: "AUTO",
    });

    return {
        answer: response.text,
        citations: response.citations,
    };
}

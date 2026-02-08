import { NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';
import * as cheerio from 'cheerio';

// Initialize Cohere Client
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { url, query, text: rawText } = await req.json();

        if ((!url && !rawText) || !query) {
            return NextResponse.json(
                { error: 'URL (or Text) and Query are required' },
                { status: 400 }
            );
        }

        let cleanText = '';

        // Case 1: URL Provided -> Fetch and scrape
        if (url) {
            console.log(`Processing URL: ${url}`);
            let html = '';
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    throw new Error(`Failed to fetch URL. Status: ${response.status} ${response.statusText}. ${errorText?.slice(0, 100)}`);
                }

                html = await response.text();
            } catch (error: any) {
                console.error(`Fetch failed for ${url}:`, error);
                // Swallow error, let the fallback logic below handle it
            }

            // Only parse if we haven't already set fallback content
            if (!cleanText && html) {
                const $ = cheerio.load(html);

                // Remove noise
                $('script').remove();
                $('style').remove();
                $('nav').remove();
                $('footer').remove();

                const text = $('body').text();
                // Clean whitespace (replace multiple newlines/spaces with single space)
                cleanText = text.replace(/\s+/g, ' ').trim();
            }

            // If scraping resulted in empty text (e.g. SPA or Auth wall), use fallback
            if (!cleanText) {
                console.warn(`Scraping yielded empty text for ${url}. Using fallback.`);

                // 1. Check for known login-wall domains
                const loginDomains = [
                    { domain: 'linkedin.com', name: 'LinkedIn' },
                    { domain: 'outlook.office.com', name: 'Outlook' },
                    { domain: 'gmail.com', name: 'Gmail' },
                    { domain: 'facebook.com', name: 'Facebook' },
                    { domain: 'instagram.com', name: 'Instagram' },
                    { domain: 'twitter.com', name: 'Twitter' },
                    { domain: 'x.com', name: 'X (Twitter)' }
                ];

                const matchedSite = loginDomains.find(d => url.includes(d.domain));

                if (matchedSite) {
                    cleanText = `[SYSTEM NOTE: The user is attempting to access a ${matchedSite.name} URL (${url}) which is behind a LOGIN WALL. You CANNOT access this page. explicitly tell the user: "This appears to be a protected ${matchedSite.name} page which requires a login. Please copy and paste the text directly into the input box so I can analyze it."]\nURL: ${url}`;
                } else {
                    // 2. Generic fallback
                    cleanText = `[SYSTEM NOTE: Unable to extract content from ${url}. The website might utilize dynamic JavaScript rendering (SPA) or block automated access. Please ask the user to verify the URL or try pasting the text directly.]\nURL: ${url}`;
                }
            }

        } else if (rawText) {
            // Case 2: Raw Text Provided
            console.log('Processing Raw Text Input');
            cleanText = rawText.replace(/\s+/g, ' ').trim();
        }

        if (!cleanText) {
            return NextResponse.json(
                { error: 'No content could be extracted from the provided input.' },
                { status: 400 }
            );
        }

        // 2. Chunking (Simple strategy for MVP)
        // Inline simple chunking or import from rag.ts if preferred. 
        // Keeping it inline here for simplicity since we modified rag.ts but haven't imported it yet.
        const chunkSize = 1000;
        let chunks: string[] = [];
        for (let i = 0; i < cleanText.length; i += chunkSize) {
            chunks.push(cleanText.slice(i, i + chunkSize));
        }

        if (chunks.length === 0) {
            chunks = [cleanText]; // Should not happen given cleanText check, but safety net
        }

        console.log(`Created ${chunks.length} chunks`);

        // 3. Rerank (Find relevant chunks)
        // If we only have one chunk (e.g. short text or fallback), we can skip rerank or just use it.
        let relevantChunks = chunks;
        if (chunks.length > 1) {
            console.log(`Reranking for query: "${query}"`);
            const rerank = await cohere.rerank({
                model: 'rerank-english-v3.0',
                query: query,
                documents: chunks.map(c => ({ text: c })),
                topN: 3,
            });
            relevantChunks = rerank.results.map(r => chunks[r.index]);
        }

        // 4. Generate Answer with Citations
        console.log('Generating answer...');
        const chatResponse = await cohere.chat({
            model: 'command-r-plus-08-2024',
            message: query,
            documents: relevantChunks.map((chunk, i) => ({
                id: `chunk_${i}`,
                text: chunk
            })),
            temperature: 0.3,
        });

        return NextResponse.json({
            answer: chatResponse.text,
            citations: chatResponse.citations,
            sources: relevantChunks
        });

    } catch (error: any) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

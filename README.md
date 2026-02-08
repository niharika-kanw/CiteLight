# 🔦 CiteLight

> **Reason over *any* website with grounded citations.**
> Powered by Next.js and Cohere (Command R+, Embed v3, Rerank v3).

![Project Demo](./public/demo.png) *(Add a screenshot here)*

## 🚀 The Problem
Large Language Models (LLMs) are amazing, but they have a fatal flaw: **Hallucinations**. 
When you ask a complex question, they guess. For enterprise use cases (legal, medical, financial), guessing is unacceptable.

## 💡 The Solution: CiteLight
**CiteLight is an Enterprise RAG Engine that prioritizes attribution over creativity.**

Unlike standard chatbots, CiteLight is designed for high-stakes/professional environments where accuracy is non-negotiable. It uses a "Truth-First" architecture:
1.  **Retrieves** content exclusively from the verified source you provide.
2.  **Reranks** information to find the most relevant facts (using `Cohere Rerank v3`).
3.  **Generates** answers with **granular citations**, allowing users to audit the AI's logic instantly.

### ✨ Key Features
- **🛡 Anti-Hallucination Architecture:** The model is strictly grounded in the provided context, significantly reducing fabrication.
- **🔍 Semantic Search & Reranking:** Uses Cohere's advanced Embed v3 and Rerank v3 models to find "needles in the haystack" better than keyword search.
- **📝 Verifiable Citations:** Every claim is backed by a clickable citation `[1]`, linking directly to the source text chunk.
- **🏢 Enterprise-Ready UI:** Features a "Login Wall" detection system that gracefully handles protected pages (like Outlook/LinkedIn) and guides users to secure alternative input methods.
- **⚡ High-Performance:** Built on Next.js 15 App Router for sub-second interactions.

## 🛠 Tech Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Framer Motion (for animations).
- **AI/LLM:** Cohere API (`command-r-plus`, `embed-english-v3.0`, `rerank-english-v3.0`).
- **Backend:** Next.js API Routes (Serverless Functions).
- **Processing:** Cheerio (for web scraping), LangChain concepts (for chunking).

## 🏃‍♂️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/citelight.git
cd citelight
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory and add your Cohere API key:
```bash
COHERE_API_KEY=your_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧠 How It Works (The RAG Pipeline)
1.  **Ingestion:** The app fetches the URL and scrapes the text content.
2.  **Chunking:** The text is split into manageable chunks (e.g., 1000 characters).
3.  **Embedding & Reranking:** Chunks are converted to vectors and reranked by relevance to the user's query.
4.  **Generation:** The top chunks are sent to Cohere's `Command R+` model, which generates an answer with citations.

## 📄 License
MIT

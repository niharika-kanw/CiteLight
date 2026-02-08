# 🎙️ CiteLight - Interview Preparation Guide

This guide is designed to help you **ace your interview** by explaining exactly what you built, why it matters, and how it works under the hood.

---

## 1. The "Elevator Pitch" (30 Seconds)
**Q: "Tell me about this project."**

> "I built **CiteLight** to solve the biggest problem with LLMs today: **Hallucinations**. 
> Most chatbots just guess answers. CiteLight is a **RAG (Retrieval-Augmented Generation)** engine that reads a specific URL, understands it, and answers questions *only* using that content. 
> I built it using **Next.js** and **Cohere's Enterprise AI Stack** (Command R+, Embed v3, and Rerank v3) because I wanted to focus on accuracy and citations, which are critical for real-world business use cases."

---

## 2. Technical Concepts (Deep Dive)

### 🧠 Concept: Embeddings (`co.embed`)
**The Analogy:** Imagine a library where books aren't organized by title, but by *meaning*. "Dog" is shelve next to "Puppy", and "King" is near "Queen".
**In Code:** We turn text chunks into long lists of numbers (vectors). Text with similar meanings have similar numbers.
**Why we use it:** To find relevant information even if the user doesn't use the exact keywords (Semantic Search).

### 🎯 Concept: Reranking (`co.rerank`)
**The Analogy:** Embeddings are like a quick Google search—fast but sometimes messy. **Reranking** is like hiring a human expert to carefully read the top 10 results and sort them by "perfect match".
**In Code:** We take the top results from the embedding search and pass them through `co.rerank`.
**Why Cohere?** Cohere's Rerank model is famous for boosting RAG accuracy by up to **50%** with a single line of code.

### 📚 Concept: Grounded Generation (RAG)
**The Analogy:** It's an open-book test. You give the AI the book (the "context") and tell it, "Answer the question using *only* this book."
**In Code:** We send the `top 3 chunks` to the `Command R+` model as `documents`.
**Why Command R+?** Other models (like GPT-4) treat context as just more text. Cohere's models are trained specifically to use provided tools/documents and generate **citations**.

---

## 3. Code Walkthrough (Where to look)

### **The Backend Logic: `src/lib/rag.ts`**
*   **Chunking:** I split the text into 1000-character blocks. (Mention that in production, you'd overlap them).
*   **Reranking:** Look at `findBestChunks`. This is the "secret sauce".

### **The API Route: `src/app/api/chat/route.ts`**
*   This is the orchestrator.
*   1. Scrape -> 2. Chunk -> 3. Rerank -> 4. Generate.

### **The Frontend: `src/app/page.tsx`**
*   **Highlighting Logic:** I used `handleCitationEnter` to match the citation's `documentIds` with the source chunks. This visualizes the "Grounding".

---

## 4. "Why Cohere?" (Talking Points)
**Specific reasons you chose Cohere for this project:**

1.  **"Native RAG Support":** Cohere's API has built-in parameters for `documents` and `citations`. With OpenAI, I'd have to write complex prompt engineering to get citations back.
2.  **"Data Privacy Focus":** Cohere is enterprise-focused. I know that building with them means I'm building for production readiness, not just a toy.
3.  **"Rerank is a Game Changer":** Mention that you know about the "Lost in the Middle" phenomenon (where LLMs forget the middle of long texts) and how Rerank solves it.

---

## 5. Potential Follow-up Questions

**Q: "How would you scale this?"**
A: "Right now it's in-memory. To scale to millions of documents, I'd use a Vector Database like **Pinecone** or **Weaviate** to store the embeddings."

A: "I'd implement a smarter chunking strategy (recursive character splitting) and handle pagination or crawling."

---

## 6. Internship Application: "Why Cohere?" Answer Guide

**Your "Secret Weapon": CiteLight**
Use this project to prove you don't just *read* about AI, you *build* with it.

**Draft Answer for Application:**
> "I am a strong fit for Cohere because I share your obsession with **grounded, reliable AI for the enterprise**. While many developers are building generic chatbots, I built **CiteLight** (linked below), a RAG engine powered by **Command R+** and **Rerank v3**. 
>
> My goal was to tackle LLM hallucinations head-on. I implemented a full RAG pipeline that scrapes live URLs, reranks chunks for relevance, and generates answers with **verifiable citations**. I specifically chose Cohere over other providers because of your native support for citations and the Rerank endpoint, which I found critical for accuracy.
>
> This project taught me the nuances of real-world AI engineering—handling edge cases like anti-bot protections, optimizing context windows, and designing UIs that build user trust. I want to bring this pragmatic, product-focused mindset to the team at Cohere."

**Link to include:**
- (If not) The GitHub Repository URL

### ⚡ Addressing the "Did you just build this?" Concern
**Don't hide it—own it.** It's actually a *huge flex* (impressive) to build a functional RAG app in a weekend for an application.

**Draft Answer:**
> "Yes! When I saw the internship posting, I didn't want to just send a generic resume. I spent this weekend building CiteLight specifically to demonstrate that I can hit the ground running with your tech stack. It shows I can learn your API quickly and ship a working product in days, not weeks."

**Why this works:**
- Shows **Initiative**: You didn't just apply; you built something.
- Shows **Speed**: You can ship fast (startups love this).
- Shows **Passion**: You care enough about Cohere to build a dedicated project.


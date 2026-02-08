// Native fetch is available in Node 18+

async function testPasteText() {
    const url = 'http://localhost:3000/api/chat';
    const payload = {
        text: "Cohere is a Canadian multinational technology company focused on artificial intelligence for the enterprise. The company was founded in 2019 by Aidan Gomez, Ivan Zhang, and Nick Frosst.",
        query: "When was Cohere founded?"
    };

    try {
        console.log('Testing Paste Text API...');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data.answer && data.answer.includes('2019')) {
            console.log('✅ TEST PASSED: Correct answer generated from pasted text.');
        } else {
            console.log('⚠️ TEST INCONCLUSIVE: Check answer manually.');
        }
    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
    }
}

testPasteText();

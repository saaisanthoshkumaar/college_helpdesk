const { dbAll } = require('../database/connection');

// Basic tokenization and normalization
const tokenize = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(token => token.length > 2); // ignore small words like "is", "a", "to"
};

const matchQuestion = async (userQuestion) => {
    const userTokens = tokenize(userQuestion);
    if (userTokens.length === 0) {
        return null;
    }

    // Fetch all published FAQs
    const faqs = await dbAll('SELECT * FROM faqs WHERE published = 1');
    
    let bestMatch = null;
    let highestScore = 0;

    for (const faq of faqs) {
        let score = 0;
        
        // Tokenize FAQ question
        const questionTokens = tokenize(faq.question);
        
        // Calculate overlap with question
        for (const token of userTokens) {
            if (questionTokens.includes(token)) {
                score += 2; // Match in title gives higher weight
            }
        }

        // Check keywords
        let keywords = [];
        if (faq.keywords_json) {
            try {
                keywords = JSON.parse(faq.keywords_json);
            } catch (e) {
                console.error('Invalid keywords JSON for FAQ', faq.id);
            }
        }

        for (const keyword of keywords) {
            const keywordTokens = tokenize(keyword);
            for (const token of userTokens) {
                if (keywordTokens.includes(token)) {
                    score += 1;
                }
            }
        }

        // Normalize score slightly by length of user question to avoid over-scoring short questions
        // Or simply use absolute score for now
        
        if (score > highestScore) {
            highestScore = score;
            bestMatch = faq;
        }
    }

    // Threshold can be adjusted. E.g., at least 2 points (one word match in title or two in keywords)
    const threshold = 2;
    if (highestScore >= threshold && bestMatch) {
        return {
            faqId: bestMatch.id,
            category: bestMatch.category,
            answer: bestMatch.answer
        };
    }

    return null; // Fallback
};

module.exports = {
    matchQuestion
};

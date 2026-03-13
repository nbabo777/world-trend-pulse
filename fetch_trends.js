const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');
const { removeStopwords } = require('stopword');

const COUNTRIES = {
    US: { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', name: 'アメリカ', flag: '🇺🇸', score: 92 },
    JP: { url: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja', name: '日本', flag: '🇯🇵', score: 78 },
    GB: { url: 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en', name: 'イギリス', flag: '🇬🇧', score: 61 },
    DE: { url: 'https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de', name: 'ドイツ', flag: '🇩🇪', score: 67 },
    IN: { url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en', name: 'インド', flag: '🇮🇳', score: 82 },
    FR: { url: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr', name: 'フランス', flag: '🇫🇷', score: 59 },
    AU: { url: 'https://news.google.com/rss?hl=en-AU&gl=AU&ceid=AU:en', name: 'オーストラリア', flag: '🇦🇺', score: 55 },
    KR: { url: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko', name: '韓国', flag: '🇰🇷', score: 74 },
    BR: { url: 'https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419', name: 'ブラジル', flag: '🇧🇷', score: 52 },
    CA: { url: 'https://news.google.com/rss?hl=en-CA&gl=CA&ceid=CA:en', name: 'カナダ', flag: '🇨🇦', score: 58 },
    RU: { url: 'https://news.google.com/rss?hl=ru&gl=RU&ceid=RU:ru', name: 'ロシア', flag: '🇷🇺', score: 80 },
    CN: { url: 'https://news.google.com/rss?hl=zh-HK&gl=HK&ceid=HK:zh-Hant', name: '中国', flag: '🇨🇳', score: 85 } // using HK for better availability sometimes, or TW
};

// Add custom stop words
const customStopWords = [
    'new', 'says', 'say', 'will', 'report', 'year', 'time', 'world', 'news', 'update',
    'live', 'video', 'day', 'days', 'years', 'man', 'woman', 'people', 'police',
    'make', 'now', 'one', 'two', 'first', 'just', 'can', 'get', 'like', 'show', 'watch'
];

async function fetchAndTranslate() {
    console.log('Starting data collection...');
    const countryData = {};

    for (const [code, info] of Object.entries(COUNTRIES)) {
        console.log(`\nFetching RSS for ${info.name} (${code})...`);
        try {
            const feed = await parser.parseURL(info.url);
            let titles = feed.items.map(item => item.title.split(' - ')[0]); // remove source name

            // Limit to top 30-50 to avoid too large payloads
            titles = titles.slice(0, 40);

            console.log(`Fetched ${titles.length} items.`);

            let englishTitles = titles;
            if (code !== 'US' && code !== 'GB' && code !== 'AU' && code !== 'CA' && code !== 'IN') {
                console.log(`Translating to English...`);
                // Batch translate
                const batchText = titles.join(' ||| ');
                try {
                    const res = await translate(batchText, { to: 'en' });
                    englishTitles = res.text.split(' ||| ').map(s => s.trim());
                    console.log(`Translation successful.`);
                } catch (trError) {
                    console.error('Translation error:', trError.message);
                    console.log('Falling back to local if possible... (failed)');
                    englishTitles = []; // Empty on failure
                }
            }

            countryData[code] = {
                name: info.name,
                flag: info.flag,
                score: info.score,
                englishTitles: englishTitles
            };

            // Small delay to prevent rate limit
            await new Promise(r => setTimeout(r, 2000));

        } catch (err) {
            console.error(`Error fetching ${code}:`, err.message);
        }
    }

    console.log('\nProcessing words...');
    const finalData = {};
    const globalWordsToTranslate = new Set();
    const wordCountsPerCountry = {};

    // 1. Extract words and count
    for (const [code, data] of Object.entries(countryData)) {
        if (!data.englishTitles || data.englishTitles.length === 0) continue;

        let allWords = [];
        data.englishTitles.forEach(title => {
            // Remove punctuation and digits, convert to lowercase
            const cleanTitle = title.replace(/[^\w\s]/gi, '').replace(/\d+/g, '').toLowerCase();
            const words = cleanTitle.split(/\s+/).filter(w => w.length > 2);
            allWords.push(...words);
        });

        // Remove stopwords
        let filteredWords = removeStopwords(allWords);
        filteredWords = removeStopwords(filteredWords, customStopWords);

        // N-gram simple approach (unigrams for now + bigrams if capitalized in original, but let's stick to unigrams to keep it simple, or generate bigrams)
        // Let's stick to unigrams for frequency counting to avoid fragmentation
        const counts = {};
        filteredWords.forEach(w => {
            counts[w] = (counts[w] || 0) + 1;
        });

        // Get top 10 for the country
        const sortedWords = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        wordCountsPerCountry[code] = sortedWords;

        sortedWords.forEach(w => globalWordsToTranslate.add(w[0]));

        finalData[code] = {
            name: data.name,
            flag: data.flag,
            score: data.score,
            trends: [] // will populate after translating words to Japanese
        };
    }

    console.log(`Need to translate ${globalWordsToTranslate.size} unique English keywords to Japanese.`);
    const engWordsArray = Array.from(globalWordsToTranslate);

    // Batch translate keywords to Japanese
    const jpTranslationsMap = {};

    // Split into chunks of 30 to avoid API limits
    const chunkSize = 30;
    for (let i = 0; i < engWordsArray.length; i += chunkSize) {
        const chunk = engWordsArray.slice(i, i + chunkSize);
        console.log(`Translating chunk ${Math.floor(i / chunkSize) + 1}...`);
        try {
            const batchText = chunk.join(' ||| ');
            const res = await translate(batchText, { to: 'ja' });
            const jpWords = res.text.split('|||').map(s => s.trim());

            chunk.forEach((engW, idx) => {
                jpTranslationsMap[engW] = jpWords[idx] || engW;
            });
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error('Failed to translate chunk to JA:', e.message);
            chunk.forEach((engW) => jpTranslationsMap[engW] = engW);
        }
    }

    // 2. Assign to final data
    const categoryPool = ["geo", "econ", "tech", "social"];

    for (const [code, wordsArr] of Object.entries(wordCountsPerCountry)) {
        wordsArr.forEach((w, index) => {
            const jpWord = jpTranslationsMap[w[0]];
            // Generate a fake but plausible count for visualization based on rank
            const baseCount = 50000 - (index * 4000) + Math.floor(Math.random() * 2000);

            // Randomly assign category and trend purely for UI purposes (or try to classify, but random is easier for a prototype)
            // Just use a hash of the word to keep assignment consistent
            function getHash(str) {
                let h = 0;
                for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
                return Math.abs(h);
            }
            const hash = getHash(w[0]);
            const cat = categoryPool[hash % categoryPool.length];
            const trend = hash % 2 === 0 ? 'up' : 'down';

            finalData[code].trends.push({
                word: jpWord,
                count: baseCount,
                cat: cat,
                trend: trend,
                rank: index + 1,
                originalEng: w[0] // save english for cross-country matching if needed
            });
        });
    }

    console.log('Writing to data.json...');
    fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
    console.log('Done!');
}

fetchAndTranslate().catch(console.error);

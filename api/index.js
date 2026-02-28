const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    } catch (e) {
        console.error('Failed to initialize Firebase Admin:', e.message);
    }
}

const firestore = admin.apps.length ? admin.firestore() : null;

const app = express();

app.use(cors());
app.use(express.json());

// --- Full Logic from Original server/index.js ---

function extractReplyContent(openRouterResponseJson) {
    const content = openRouterResponseJson?.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
        const trimmed = content.trim();
        return trimmed.length ? trimmed : null;
    }
    if (Array.isArray(content)) {
        const joined = content
            .map((part) => (typeof part === 'string' ? part : part?.text))
            .filter(Boolean)
            .join('')
            .trim();
        return joined.length ? joined : null;
    }
    if (content && typeof content === 'object') {
        const maybeText = content.text || content.content;
        if (typeof maybeText === 'string') {
            const trimmed = maybeText.trim();
            return trimmed.length ? trimmed : null;
        }
    }
    return null;
}

function normalizeText(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(s) {
    const t = normalizeText(s);
    if (!t) return [];
    return t.split(' ').filter(Boolean);
}

function parseProductLine(line) {
    const raw = String(line || '').trim();
    const m = raw.match(/^(.*?)\s*\((.*?)\)\s*-\s*(.*?)\s*bdt\s*$/i);
    if (!m) return { raw, name: raw, category: '', price: '' };
    return { raw, name: m[1].trim(), category: m[2].trim(), price: m[3].trim() };
}

function toNumberOrNull(v) {
    const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : null;
}

function normalizeProduct(p) {
    if (!p || typeof p !== 'object') return null;
    const id = p.id ?? p._id ?? p.productId ?? null;
    const name = String(p.name ?? '').trim();
    if (!name) return null;
    const category = String(p.category ?? '').trim();
    const price = toNumberOrNull(p.price);
    const discount = toNumberOrNull(p.discount) ?? 0;
    const stock = toNumberOrNull(p.stock) ?? 1;
    const imageUrl = p.imageUrl || p.image || (Array.isArray(p.imageUrls) ? p.imageUrls[0] : null) || null;
    const description = String(p.description ?? '').trim();
    return { id, name, category, price, discount, stock, imageUrl, description };
}

function coerceProducts(productContext) {
    if (!Array.isArray(productContext)) return [];
    return productContext.map(normalizeProduct).filter(Boolean);
}

async function loadAllProductsFromFirestore() {
    if (!firestore) return [];
    try {
        const snap = await firestore.collection('products').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error('Error loading products from Firestore:', e);
        return [];
    }
}

function isShowMoreIntent(text) {
    const t = normalizeText(text);
    if (!t) return false;
    return t.includes('other') || t.includes('another') || t.includes('more') || t.includes('আরও');
}

function expandQueryTokens(tokens) {
    const extra = new Set(tokens);
    const synonymGroups = [
        ['watch', '\u0998\u09dc\u09bf', 'smartwatch', 'smart', 'ghori'],
        ['phone', 'mobile', '\u09ae\u09cb\u09ac\u09be\u0987\u09b2', '\u09ab\u09cb\u09a8', 'iphone', 'android'],
        ['laptop', 'notebook', '\u09b2\u09cd\u09af\u09be\u09aa\u099f\u09aa'],
        ['shoe', 'shoes', '\u099c\u09c1\u09a4\u09be', 'running']
    ];
    for (const group of synonymGroups) {
        for (const t of tokens) {
            if (group.includes(t)) group.forEach(g => extra.add(g));
        }
    }
    return [...extra];
}

function pickRelevantProducts(productContext, joinedUserText) {
    const products = coerceProducts(productContext);
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
    const qTokenSet = new Set(expandQueryTokens(tokenize(joinedUserText)));

    const scored = products.map((p) => {
        const hay = tokenize(`${p.name} ${p.category} ${p.description || ''}`);
        let score = 0;
        for (const tok of hay) if (qTokenSet.has(tok)) score += 2;
        const q = normalizeText(joinedUserText);
        const pn = normalizeText(p.name);
        if (q && pn && (pn.includes(q) || q.includes(pn))) score += 8;
        return { p, score };
    });

    const topMatches = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map(x => x.p);
    const qNorm = normalizeText(joinedUserText);
    const isGreeting = ['hi', 'hello', 'hey', 'assalam', 'salam'].some(g => qNorm.includes(g));

    return { topMatches, categories, isGreeting, allProducts: products };
}

// Chatbot route
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, products: productContextFromClient } = req.body || {};
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.REACT_APP_OPENROUTER_API_KEY;

        if (!apiKey) return res.status(500).json({ error: 'API Key missing.' });

        let productContext = firestore ? await loadAllProductsFromFirestore() : (productContextFromClient || []);
        const lastUsers = messages.filter(m => m.role === 'user').slice(-3).map(m => m.content);
        const joinedUserText = lastUsers.join(' ');
        const { topMatches, categories, isGreeting } = pickRelevantProducts(productContext, joinedUserText);

        const dellaTraining = `You are Della from DELLA store. 
    Inventory: ${topMatches.length ? topMatches.map(p => `- ${p.name}: ${p.price} BDT`).join('\n') : 'No specific matches.'}
    Categories: ${categories.join(', ')}`;

        const modelAttempts = [
            'stepfun/step-3.5-flash:free',
            'google/gemma-3-12b-it:free',
            'meta-llama/llama-3.3-70b-instruct:free'
        ];

        for (const model of modelAttempts) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'X-Title': 'Della Shopping Assistant'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'system', content: dellaTraining }, ...messages],
                        max_tokens: 150
                    })
                });

                const data = await response.json();
                const reply = extractReplyContent(data);

                if (response.ok && reply) {
                    if (isGreeting) {
                        return res.json({ reply: 'হাই! আপনি কোনটা খুঁজছেন—ফোন, ঘড়ি, ল্যাপটপ, নাকি জুতা?', products: [] });
                    }
                    return res.json({ reply, products: topMatches });
                }
            } catch (e) {
                console.error(`Attempt failed for ${model}`, e);
            }
        }
        res.status(502).json({ error: 'AI services are busy.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = app;

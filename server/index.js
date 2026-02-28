const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const admin = require('firebase-admin');

// Load env from both repo root and server folder so it works regardless of where you start Node from.
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS or default credentials)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (e) {
    console.error('Failed to initialize Firebase Admin. Firestore access will be unavailable.', e.message);
  }
}

const firestore = admin.apps.length ? admin.firestore() : null;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import OTP service
const otpService = require('./otp-service');

// Mock Data
const products = [
  { 
    id: 1, 
    name: "Smartphone 14 Pro", 
    category: "Electronics", 
    price: 999.00, 
    image: "https://via.placeholder.com/300x300.png?text=Phone",
    description: "The latest smartphone with advanced features. 6.1-inch Super Retina XDR display.",
    condition: "New"
  },
  { 
    id: 2, 
    name: "Laptop X1 Carbon", 
    category: "Electronics", 
    price: 1499.00, 
    image: "https://via.placeholder.com/300x300.png?text=Laptop",
    description: "Ultralight and powerful. 14-inch display, Intel Core i7, 16GB RAM.",
    condition: "Refurbished"
  },
  { 
    id: 3, 
    name: "Running Shoes", 
    category: "Fashion", 
    price: 89.99, 
    image: "https://via.placeholder.com/300x300.png?text=Shoes",
    description: "Comfortable running shoes for all terrains. Breathable mesh upper.",
    condition: "New"
  },
  { 
    id: 4, 
    name: "Smart Watch Series 8", 
    category: "Electronics", 
    price: 399.00, 
    image: "https://via.placeholder.com/300x300.png?text=Watch",
    description: "Advanced health sensors and apps. Always-On Retina display.",
    condition: "Used"
  },
  { 
    id: 5, 
    name: "Headphones ANC", 
    category: "Electronics", 
    price: 199.00, 
    image: "https://via.placeholder.com/300x300.png?text=Headphones",
    description: "Active Noise Cancelling headphones. 30-hour battery life.",
    condition: "New"
  },
  { 
    id: 6, 
    name: "Vintage Camera", 
    category: "Collectibles", 
    price: 450.00, 
    image: "https://via.placeholder.com/300x300.png?text=Camera",
    description: "Classic film camera from the 1980s. Fully functional.",
    condition: "Used"
  },
];

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
  // Expected: "Name (Category) - 166502 BDT"
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

  const sizes =
    p.sizes && typeof p.sizes === 'object' && !Array.isArray(p.sizes) ? p.sizes : null;
  let sizesTotal = null;
  if (sizes) {
    sizesTotal = Object.values(sizes)
      .map((v) => Number(v || 0))
      .filter((n) => Number.isFinite(n))
      .reduce((a, b) => a + b, 0);
  }

  let stock = sizesTotal != null ? sizesTotal : toNumberOrNull(p.stock);
  if (!Number.isFinite(stock)) {
    stock = 1; // default to in-stock when we don't know
  }

  const imageUrl = p.imageUrl || p.image || (Array.isArray(p.imageUrls) ? p.imageUrls[0] : null) || null;
  const description = String(p.description ?? '').trim();
  const condition = String(p.condition ?? '').trim();
  const brand = String(p.brand ?? '').trim();
  return {
    id,
    name,
    category,
    price,
    discount,
    stock,
    imageUrl,
    imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : undefined,
    sizes: sizes || undefined,
    description,
    condition,
    brand
  };
}

function coerceProducts(productContext) {
  if (!Array.isArray(productContext)) return [];
  // If items are strings (old client), parse minimal objects.
  if (productContext.length && typeof productContext[0] === 'string') {
    return productContext
      .map((line) => {
        const parsed = parseProductLine(line);
        return normalizeProduct({
          id: null,
          name: parsed.name,
          category: parsed.category,
          price: toNumberOrNull(parsed.price) ?? parsed.price,
          imageUrl: null,
          description: ''
        });
      })
      .filter(Boolean);
  }

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
  return (
    t.includes('other') ||
    t.includes('another') ||
    t.includes('more') ||
    t.includes('different') ||
    t.includes('model') ||
    t.includes('আরও') ||
    t.includes('আর') ||
    t.includes('অন্য') ||
    t.includes('আরেক') ||
    t.includes('আরো')
  );
}

function expandQueryTokens(tokens) {
  const extra = new Set(tokens);

  // Very small Banglish/Bangla synonym expansion (extend anytime).
  const synonymGroups = [
    ['watch', 'ঘড়ি', 'ঘড়ি', 'smartwatch', 'smart', 'ghori'],
    ['phone', 'mobile', 'মোবাইল', 'ফোন', 'iphone', 'android'],
    ['laptop', 'notebook', 'ল্যাপটপ'],
    ['shoe', 'shoes', 'জুতা', 'জুত', 'running'],
    ['headphone', 'headphones', 'earphone', 'earphones', 'হেডফোন', 'ইয়ারফোন'],
    ['camera', 'ক্যামেরা'],
    ['electronics', 'ইলেকট্রনিক্স'],
    ['fashion', 'ফ্যাশন'],
    ['collectibles', 'কালেক্টিবল', 'collectible']
  ];

  const groupsByToken = new Map();
  for (const group of synonymGroups) {
    for (const t of group) groupsByToken.set(t, group);
  }

  for (const t of tokens) {
    const group = groupsByToken.get(t);
    if (group) for (const g of group) extra.add(g);
  }
  return [...extra];
}

function pickRelevantProducts(productContext, joinedUserText) {
  const products = coerceProducts(productContext);
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  const qTokens = expandQueryTokens(tokenize(joinedUserText));
  const qTokenSet = new Set(qTokens);

  const scored = products.map((p) => {
    const hay = tokenize(`${p.name} ${p.category} ${p.brand || ''} ${p.description || ''}`);
    let score = 0;
    for (const tok of hay) {
      if (qTokenSet.has(tok)) score += 2;
    }

    const q = normalizeText(joinedUserText);
    const pn = normalizeText(p.name);
    const pc = normalizeText(p.category);
    if (q && pn && (pn.includes(q) || q.includes(pn))) score += 8;
    if (q && pc && q.includes(pc)) score += 3;

    return { p, score };
  });

  const topMatches = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.p);

  // If greeting/very short message, don’t force product listing.
  const qNorm = normalizeText(joinedUserText);
  const isGreeting =
    ['hi', 'hello', 'hey', 'assalamualaikum', 'assalamu alaikum', 'salam', 'yo', 'hola'].includes(qNorm) ||
    qNorm === 'hii' ||
    qNorm === 'hlw';

  return { topMatches, categories, isGreeting, allProducts: products };
}

// Chatbot route: proxy to OpenRouter
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, products: productContextFromClient } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload: messages must be an array.' });
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.REACT_APP_OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Server misconfigured: OPENROUTER_API_KEY (or REACT_APP_OPENROUTER_API_KEY) missing.'
      });
    }

    // Prefer live Firestore data; fall back to client-provided products if Firestore not available.
    let productContext = [];
    if (firestore) {
      productContext = await loadAllProductsFromFirestore();
    } else if (Array.isArray(productContextFromClient)) {
      productContext = productContextFromClient;
    }

    const lastUsers = [...messages].filter((m) => m?.role === 'user').slice(-3).map((m) => m.content || '');
    const joinedUserText = lastUsers.join(' ');
    const { topMatches, categories, isGreeting, allProducts } = pickRelevantProducts(productContext, joinedUserText);
    const wantsMore = isShowMoreIntent(lastUsers[lastUsers.length - 1] || '');

    const primaryCategory = topMatches[0]?.category;
    const alternates = wantsMore && primaryCategory
      ? allProducts.filter((p) => p.category === primaryCategory && !topMatches.find((t) => String(t.id) === String(p.id))).slice(0, 6)
      : [];

    const cardsToShow = [...topMatches, ...alternates].slice(0, 6);

    const dellaTraining = `
      You are 'Della' from 'DELLA' store. 
      
      GOAL:
      - Help users find products from our inventory.
      - Understand Banglish + Bangla + English. Reply in Bangla or English.

      BEHAVIOR RULES:
      1. Be brief (usually 1-3 short lines).
      2. Do NOT list products unless the user asks for a product/category (e.g., "watch", "phone", "shoes") or asks "show".
      3. NEVER recommend unrelated items. If user asks for "watch", do NOT show shoes/phone.
      4. Only mention items that appear in INVENTORY below (no hallucinations).
      5. If no matching items exist, say it's not available and suggest 2-3 categories from CATEGORY LIST.

      OUTPUT FORMAT (only when listing products):
      - [Name]: [Price] BDT

      CATEGORY LIST:
      ${categories.length ? categories.join(', ') : 'Loading...'}

      INVENTORY (MATCHED ITEMS):
      ${topMatches.length
        ? topMatches
          .map((p) => `- ${p.name}: ${p.price ?? 'N/A'} BDT${p.discount ? ` (discount ${p.discount}%)` : ''}`)
          .join('\n')
        : 'No matched items.'}
      
      IMPORTANT: Do NOT output reasoning. Only output the final answer.
      Language: Bangla or English.
    `;

    const modelAttempts = [
      { model: 'stepfun/step-3.5-flash:free', supportsSystem: true },
      { model: 'z-ai/glm-4.5-air:free', supportsSystem: true },
      { model: 'upstage/solar-pro-3:free', supportsSystem: true },
      { model: 'qwen/qwen3-next-80b-a3b-instruct:free', supportsSystem: true },
      { model: 'arcee-ai/trinity-large-preview:free', supportsSystem: true },
      { model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', supportsSystem: true },
      { model: 'google/gemma-3-12b-it:free', supportsSystem: true },
      // Some Gemma 3n variants reject system/developer instructions via certain providers.
      { model: 'google/gemma-3n-e4b-it:free', supportsSystem: false },
      { model: 'google/gemma-3n-e2b-it:free', supportsSystem: false },
      { model: 'meta-llama/llama-3.3-70b-instruct:free', supportsSystem: true },
      { model: 'openai/gpt-oss-120b:free', supportsSystem: true }
    ];

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Della Shopping Assistant'
    };

    let lastErrorMessage = 'AI services are busy.';

    for (const attempt of modelAttempts) {
      const routedMessages = attempt.supportsSystem
        ? [{ role: 'system', content: dellaTraining }, ...messages]
        : [{ role: 'user', content: `INSTRUCTIONS:\n${dellaTraining}` }, ...messages];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: attempt.model,
            messages: routedMessages,
            max_tokens: 150,
            temperature: 0.5
          })
        });

        const data = await response.json();
        const reply = extractReplyContent(data);

        if (response.ok && reply) {
          // If it's a pure greeting, prefer a short helpful response, not a product dump.
          if (isGreeting) {
            return res.json({
              reply: 'হাই! আপনি কোনটা খুঁজছেন—ফোন, ঘড়ি, ল্যাপটপ, নাকি জুতা?',
              model: 'rule',
              products: []
            });
          }
          return res.json({
            reply,
            model: attempt.model,
            products: cardsToShow
          });
        }

        const errMsg = data?.error?.message || (response.ok ? 'Empty response' : 'Provider returned error');
        lastErrorMessage = errMsg;
        console.error(`OpenRouter attempt failed (${attempt.model})`, data);
      } catch (e) {
        lastErrorMessage = e?.name === 'AbortError' ? 'Upstream timeout' : (e?.message || lastErrorMessage);
        console.error(`OpenRouter attempt error (${attempt.model})`, e);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    return res.status(502).json({ error: lastErrorMessage });
  } catch (err) {
    console.error('Chat route error:', err);
    return res.status(500).json({ error: err.message || 'Unexpected server error.' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to Della API');
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).send('Product not found');
  res.json(product);
});

// OTP Routes
app.use('/api/otp', otpService);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

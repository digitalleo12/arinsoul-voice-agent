const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Priya, a warm and caring voice assistant for ArinSoul — an NLP coaching service in India run by Arin.

SPEAK ONLY in Hinglish (natural Hindi + English mix), like a close friend who genuinely cares. Keep every reply to 2-3 short sentences max — this is a voice conversation so be concise and natural.

KEY FACTS:
- ₹99 introductory session = 30 minutes 1-on-1 NLP coaching online (video/call)
- Helps with: anxiety, stress, overthinking, mental blocks, low confidence
- Book at arinsoul.in → "Book My Session" → pay ₹99 via UPI/card → WhatsApp confirmation
- FREE bonus kit worth ₹7,000+ included (guided audio, worksheets, 7-day practice)
- 100% private, no judgment

RESPOND DIRECTLY to what the person says:
- If they mention overthinking/anxiety/stress → acknowledge it warmly, confirm the session helps with exactly that, invite them to book
- If they ask about price → "Sirf 99 rupaye mein 30 minute ka personal session milta hai, bilkul risk-free!"
- If they ask how to book → "arinsoul.in pe jaiye, 'Book My Session' click karein, 99 rupaye pay karein UPI se, aur WhatsApp pe confirmation aayega"
- If they ask what happens in session → "Aapke overthinking ya anxiety ki root cause samjhenge, ek NLP technique sikhenge, aur mental clarity milegi"
- If distressed → be extra warm, validate their feeling, gently suggest the session as a first step

NEVER say generic greetings as a response. ALWAYS directly address what they said.
NEVER be pushy. Be like a helpful friend, not a salesperson.`;

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ArinSoul Voice Agent is running 🎙️' });
});

// ─── Main Voice Chat Endpoint ─────────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  try {
    const { audio } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'No audio received.' });
    }

    // ── Step 1: Speech → Text (Sarvam STT) ──────────────────────────────────
    const audioBuffer = Buffer.from(audio, 'base64');

    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'voice.webm',
      contentType: 'audio/webm',
    });
    formData.append('model', 'saarika:v2.5');
    formData.append('mode', 'transcribe');

    const sttResponse = await axios.post(
      'https://api.sarvam.ai/speech-to-text',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'api-subscription-key': SARVAM_API_KEY,
        },
        timeout: 15000,
      }
    );

    const userText = sttResponse.data.transcript?.trim();

    if (!userText) {
      return res.json({ error: 'Sunai nahi diya. Dobara bolein please!', audio: null });
    }

    console.log(`[STT] User said: "${userText}"`);

    // ── Step 2: Text → LLM Response (Sarvam Chat) ───────────────────────────
    const chatResponse = await axios.post(
      'https://api.sarvam.ai/v1/chat/completions',
      {
        model: 'sarvam-105b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userText },
        ],
        max_tokens: 600,
        temperature: 0.7,
      },
      {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    console.log('[LLM Raw]', JSON.stringify(chatResponse.data));

    const botText = chatResponse.data.choices?.[0]?.message?.content?.trim()
      || chatResponse.data.content?.trim()
      || chatResponse.data.text?.trim()
      || 'Aapki baat sun li. Kya aap ek baar 99 rupaye wala session try karein?';

    console.log(`[LLM] Bot reply: "${botText}"`);

    // ── Step 3: Text → Speech (Sarvam TTS) ──────────────────────────────────
    let audioBase64 = null;

    try {
      const ttsResponse = await axios.post(
        'https://api.sarvam.ai/text-to-speech',
        {
          inputs: [botText],
          target_language_code: 'hi-IN',
          model: 'bulbul:v2',
          speaker: 'anushka',
          pace: 1.0,
          speech_sample_rate: 22050,
          enable_preprocessing: true,
        },
        {
          headers: {
            'api-subscription-key': SARVAM_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      audioBase64 = ttsResponse.data.audios?.[0] ?? null;
      console.log('[TTS] audio received:', audioBase64 ? 'yes (' + audioBase64.length + ' chars)' : 'null');
    } catch (ttsErr) {
      console.error('[TTS Error]', ttsErr.response?.data || ttsErr.message);
      // Continue without audio — text response still goes through
    }

    // ── Return to frontend ───────────────────────────────────────────────────
    res.json({ userText, botText, audio: audioBase64 });

  } catch (err) {
    const errMsg = err.response?.data || err.message;
    console.error('[ERROR]', errMsg);
    res.status(500).json({
      error: 'Kuch problem aa gayi. Thodi der baad dobara try karein!',
      detail: errMsg,
    });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ ArinSoul Voice Agent running on port ${PORT}`);
  if (!SARVAM_API_KEY) {
    console.warn('⚠️  WARNING: SARVAM_API_KEY not set!');
  }
});

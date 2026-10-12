import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for model selection
const TEXT_MODEL = 'gemini-3.8-flash';
const TRANSCRIBE_MODEL = 'gemini-3.5-transcribe';

/**
 * 1. AI Conversation Coach Chat Endpoint
 * Conducts one-question-at-a-time interactive coaching for camera confidence.
 */
app.post('/api/coach/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, productName, category, isHelpRequested } = req.body;

    const systemPrompt = `
Kamu adalah "Beauty Content Buddy", asisten dan teman ngobrol personal untuk beauty content creator Indonesia di TikTok dan Instagram Reels.
Tujuan utamamu: Melatih creator mengembangkan cerita secara natural saat berbicara di depan kamera (bukan memberikan script hafalan panjang!).

ATURAN PERILAKU MUTLAK:
1. Ajukan HANYA SATU (1) pertanyaan sederhana per giliran. Jangan dobel pertanyaan.
2. JANGAN PERNAH memberikan script panjang atau jawaban template di giliran ini.
3. JANGAN mengarang pengalaman, klaim skincare, atau hasil produk yang belum diceritakan creator. Gunakan hanya pengalaman asli creator.
4. Gunakan bahasa Indonesia natural, conversational, akrab seperti sahabat sesama creator ("kamu", "bestie", "finish-nya dewy/matte", "swatch", "dry patch", "oxidize", "ngeset", "coverage").
5. Alur tahapan cerita:
   - Tahap 1: Hook / First impression & kenapa tertarik coba
   - Tahap 2: Tekstur, formula, & sensasi saat diaplikasikan
   - Tahap 3: Performa / ketahanan / reaksi di kulit (masalah apa yang diselesaikan)
   - Tahap 4: Opini jujur (kelebihan & kekurangan yang dirasakan)
   - Tahap 5: Kesimpulan / Rekomendasi (cocok untuk siapa & vibe akhirnya)
6. Jika user meminta bantuan (isHelpRequested = true) atau user tampak blank, berikan dorongan hangat dan sertakan 2-3 pilihan jawaban pancingan (suggestedAnswers) yang relevan dan relatable.
7. Berikan satu tips gestur kamera singkat (cameraTip) untuk membantu rasa percaya diri saat rekam video.

Konteks saat ini:
- Produk: ${productName || 'Belum disebutkan'}
- Kategori: ${category || 'Beauty umum'}
- Permintaan bantuan (user lagi blank?): ${isHelpRequested ? 'YA, user minta bantuan ide' : 'TIDAK, lanjutkan percakapan biasa'}
`.trim();

    const conversationHistory = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [
            {
              text: isHelpRequested
                ? 'Aku lagi agak blank nih bestie, tolong kasih pancingan pertanyaan atau ide jawaban yang natural dong!'
                : 'Lanjutkan giliran percakapan ini. Berikan tanggapan singkat dan SATU pertanyaan lanjutan.',
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Tanggapan hangat singkat (1-2 kalimat) diikuti SATU pertanyaan percakapan santai.',
            },
            stage: {
              type: Type.STRING,
              description: 'Nama tahap cerita saat ini: Hook Pembuka, Tekstur & Aplikasi, Performa & Ketahanan, Opini Jujur (Pros & Cons), atau Rekomendasi & Closing.',
            },
            stageIndex: {
              type: Type.INTEGER,
              description: 'Nomor tahap dari 1 sampai 5.',
            },
            isReadyToSummarize: {
              type: Type.BOOLEAN,
              description: 'True jika cerita sudah mencakup pembuka, pengalaman, opini, dan kesimpulan sehingga siap dirangkum menjadi talking points.',
            },
            suggestedAnswers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 opsi jawaban atau pancingan ide singkat jika creator bingung menjawab.',
            },
            cameraTip: {
              type: Type.STRING,
              description: '1 tips gestur atau ekspresi santai di depan kamera yang relevan.',
            },
          },
          required: ['reply', 'stage', 'stageIndex', 'isReadyToSummarize', 'suggestedAnswers', 'cameraTip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/coach/chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal memproses percakapan coach',
      fallback: {
        reply: 'Wah menarik banget! Waktu kamu pertama kali swipe atau tap produk ini, sensasi atau tekstur apa yang paling terasa?',
        stage: 'Tekstur & Aplikasi',
        stageIndex: 2,
        isReadyToSummarize: false,
        suggestedAnswers: [
          'Teksturnya ringan banget kayak air',
          'Awalnya agak lengket tapi cepet ngeset',
          'Creamy dan gampang banget di-blend',
        ],
        cameraTip: 'Bisa sambil tunjukin close-up produk ke kamera sambil tersenyum santai ya!',
      },
    });
  }
});

/**
 * 2. Summarize Coach Conversation into Talking Points Cue Cards
 */
app.post('/api/coach/summarize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversation, productName, category } = req.body;

    const transcriptText = (conversation || [])
      .map((c: { role: string; content: string }) => `${c.role === 'model' ? 'Coach' : 'Creator'}: ${c.content}`)
      .join('\n');

    const prompt = `
Berikut adalah riwayat obrolan latihan speaking seorang beauty creator:
Konteks:
- Produk: ${productName || 'Produk kecantikan'}
- Kategori: ${category || 'Review & Tips'}

Percakapan:
${transcriptText}

TUGAS:
Ubah percakapan dan pengalaman ASLI creator di atas menjadi "TALKING POINTS KARTU REKAM" untuk video TikTok/Reels.
ATURAN:
1. JANGAN bikin script panjang yang harus dihafal! Creator benci membaca teks kata-demi-kata.
2. Buat berupa poin-poin kata kunci singkat (bullet points) yang mudah diintip sekilas di layar HP saat merekam.
3. Pertahankan opini asli creator (apa yang dia suka, apa yang kurang).
4. Berikan 3 variasi Hook 3 detik pertama yang menarik perhatian.
5. Berikan instruksi visual b-roll (misal: "close-up swatch", "half-face comparison").
`.trim();

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Judul konsep video' },
            hooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 pilihan kalimat pembuka (hook) 3 detik yang catchy dan natural.',
            },
            talkingPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: 'Perkiraan durasi misal 00-03s, 04-15s' },
                  label: { type: Type.STRING, description: 'Bagian: Hook, Tekstur, Wear-test, atau Verdict' },
                  bulletPoint: { type: Type.STRING, description: 'Kata kunci utama (ringkas, 1-2 baris saja)' },
                  cameraAction: { type: Type.STRING, description: 'Aksi visual yang dilakukan ke kamera' },
                },
                required: ['timestamp', 'label', 'bulletPoint', 'cameraAction'],
              },
            },
            honestVerdict: {
              type: Type.OBJECT,
              properties: {
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                bestFor: { type: Type.STRING, description: 'Cocok buat siapa' },
              },
              required: ['pros', 'cons', 'bestFor'],
            },
            captionIdea: { type: Type.STRING, description: 'Ide caption santai + hashtag' },
          },
          required: ['title', 'hooks', 'talkingPoints', 'honestVerdict', 'captionIdea'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/coach/summarize:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal merangkum talking points' });
  }
});

/**
 * 3. Content Ideas Generator Endpoint
 */
app.post('/api/ideas/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, productName, personalExperience, targetAudience } = req.body;

    const prompt = `
Kamu adalah konsultan kreatif untuk content creator kecantikan TikTok & Instagram Reels di Indonesia.
Hasilkan ide konten untuk kategori: "${category}".
Informasi produk/topik: "${productName || 'Produk viral kecantikan'}"
Pengalaman pribadi creator: "${personalExperience || 'Belum ada catatan khusus'}"
Target audiens: "${targetAudience || 'Beauty enthusiast Indonesia'}"

ATURAN PENTING:
- JANGAN langsung buat script panjang!
- Berikan 3 konsep konten yang berbeda angle (misal: Angle 1: Wear Test Jujur, Angle 2: Problem Solver / Tips, Angle 3: GRWM Chit-chat).
- Tiap konsep harus memiliki:
  1. Judul & Vibe konten
  2. 3 pilihan Hook pembuka yang bikin orang stop scrolling (bukan gaya presenter kaku)
  3. 3 sampai 5 Talking Points ringkas (bukan script hafalan)
  4. Saran visual B-Roll / aksi kamera
  5. Alasan kenapa format ini bekerja di algoritma Reels/TikTok
`.trim();

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  conceptTitle: { type: Type.STRING },
                  vibe: { type: Type.STRING, description: 'Tone: e.g. "Chit-chat santai", "Review to the point", "Eksperimen"' },
                  hooks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 pilihan kalimat pembuka (hook) 3 detik',
                  },
                  talkingPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 sampai 5 talking points singkat',
                  },
                  visualActions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Aksi visual di depan kamera (misal: zoom-in swatch, tes blotting)',
                  },
                  whyItWorks: { type: Type.STRING },
                },
                required: ['conceptTitle', 'vibe', 'hooks', 'talkingPoints', 'visualActions', 'whyItWorks'],
              },
            },
          },
          required: ['ideas'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed.ideas || [] });
  } catch (error: any) {
    console.error('Error in /api/ideas/generate:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menghasilkan ide konten' });
  }
});

/**
 * 4. Voice Dump Analysis
 * Structures spontaneous brain dump audio/transcripts into talking points.
 */
app.post('/api/voicedump/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Transkrip suara tidak boleh kosong' });
      return;
    }

    const prompt = `
Berikut adalah "Voice Dump" (rekaman celoteh bebas / unboxing / unedited thoughts) dari seorang beauty content creator:

"""${transcript}"""

TUGAS AI:
1. Rangkum inti cerita utama (2-3 kalimat santai).
2. Kelompokkan apa saja pengalaman positif / yang disukai (pros).
3. Kelompokkan apa saja yang kurang disukai / catatan jujur (cons).
4. Temukan bagian cerita yang masih kurang jelas atau belum lengkap (missing pieces, e.g. belum sebut harga, jenis kulit, atau ketahanan jam ke berapa).
5. Usulkan 2-3 pertanyaan lanjutan yang bisa dijawab creator agar ceritanya makin utuh.
6. Ubah menjadi 3-5 Talking Points ringkas yang siap dibaca sekilas saat rekam video.
`.trim();

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Rangkuman inti cerita' },
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Hal-hal yang disukai' },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Hal-hal yang kurang disukai' },
            unclearParts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Bagian yang belum jelas atau kurang' },
            followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3 pertanyaan pancingan lanjutan' },
            talkingPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING },
                  bullet: { type: Type.STRING },
                  actionTip: { type: Type.STRING },
                },
                required: ['stage', 'bullet', 'actionTip'],
              },
            },
          },
          required: ['summary', 'pros', 'cons', 'unclearParts', 'followUpQuestions', 'talkingPoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/voicedump/analyze:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menganalisis voice dump' });
  }
});

/**
 * 5. Audio Transcription Endpoint via Gemini
 */
app.post('/api/transcribe', async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      res.status(400).json({ success: false, error: 'Data audio diperlukan' });
      return;
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: TRANSCRIBE_MODEL,
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transkripsikan audio ini dalam Bahasa Indonesia secara akurat dan natural. Pertahankan istilah kecantikan seperti shade, swatch, undertone, finish, transferproof.',
          },
        ],
      },
    });

    res.json({ success: true, transcript: response.text || '' });
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal mentranskripsikan audio' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Beauty Content Buddy running on http://localhost:${PORT}`);
  });
}

startServer();

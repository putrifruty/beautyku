import { CoachMessage, CategoryType, GeneratedIdea, CoachSummaryResult, VoiceDumpAnalysis } from '../types';

export const api = {
  async sendCoachChat(params: {
    messages: { role: 'user' | 'model'; content: string }[];
    productName?: string;
    category?: CategoryType | string;
    isHelpRequested?: boolean;
  }): Promise<{
    reply: string;
    stage: string;
    stageIndex: number;
    isReadyToSummarize: boolean;
    suggestedAnswers: string[];
    cameraTip: string;
  }> {
    const res = await fetch('/api/coach/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      if (data.fallback) {
        return data.fallback;
      }
      throw new Error(data.error || 'Gagal memproses percakapan coach');
    }
    return data.data;
  },

  async summarizeCoach(params: {
    conversation: CoachMessage[];
    productName?: string;
    category?: string;
  }): Promise<CoachSummaryResult> {
    const res = await fetch('/api/coach/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal merangkum talking points');
    }
    return data.data;
  },

  async generateIdeas(params: {
    category: string;
    productName?: string;
    personalExperience?: string;
    targetAudience?: string;
  }): Promise<GeneratedIdea[]> {
    const res = await fetch('/api/ideas/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal menghasilkan ide konten');
    }
    return (data.data || []).map((item: any, i: number) => ({
      ...item,
      id: `idea-${Date.now()}-${i}`,
      category: params.category,
      productName: params.productName,
    }));
  },

  async analyzeVoiceDump(params: { transcript: string }): Promise<VoiceDumpAnalysis> {
    const res = await fetch('/api/voicedump/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal menganalisis voice dump');
    }
    return data.data;
  },

  async transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm'): Promise<string> {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mentranskripsikan audio');
    }
    return data.transcript || '';
  },
};

export type CategoryType =
  | 'Lip product review'
  | 'Skincare before makeup'
  | 'Makeup review'
  | 'Honest review'
  | 'Beauty tips'
  | 'Beauty things I wish I knew earlier'
  | 'GRWM'
  | 'Beauty and lifestyle';

export type ProductStatus = 'Ingin dicoba' | 'Sedang dipakai' | 'Favorit' | 'Sudah habis';

export interface StashProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  shade?: string;
  image?: string;
  personalExperience: string;
  pros: string[];
  cons: string[];
  status: ProductStatus;
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  suggestedAnswers?: string[];
  cameraTip?: string;
  stage?: string;
}

export interface TalkingPointItem {
  timestamp: string;
  label: string;
  bulletPoint: string;
  cameraAction: string;
}

export interface CoachSummaryResult {
  title: string;
  hooks: string[];
  talkingPoints: TalkingPointItem[];
  honestVerdict: {
    pros: string[];
    cons: string[];
    bestFor: string;
  };
  captionIdea: string;
}

export interface CoachSession {
  id: string;
  productName: string;
  category: CategoryType | string;
  topic?: string;
  messages: CoachMessage[];
  stage: string;
  stageIndex: number;
  isReadyToSummarize: boolean;
  summaryResult?: CoachSummaryResult;
  updatedAt: string;
}

export interface GeneratedIdea {
  id: string;
  conceptTitle: string;
  vibe: string;
  hooks: string[];
  talkingPoints: string[];
  visualActions: string[];
  whyItWorks: string;
  category: string;
  productName?: string;
}

export interface VoiceDumpAnalysis {
  summary: string;
  pros: string[];
  cons: string[];
  unclearParts: string[];
  followUpQuestions: string[];
  talkingPoints: {
    stage: string;
    bullet: string;
    actionTip: string;
  }[];
}

export interface VoiceDumpItem {
  id: string;
  title: string;
  transcript: string;
  analysis?: VoiceDumpAnalysis;
  createdAt: string;
}

export type PlannerStatus = 'Ide' | 'Siap direkam' | 'Sudah direkam' | 'Sedang diedit' | 'Sudah diunggah';
export type PlatformType = 'TikTok' | 'Instagram Reels' | 'TikTok & Reels';

export interface PlannerItem {
  id: string;
  title: string;
  targetDate: string;
  platform: PlatformType;
  category: CategoryType | string;
  status: PlannerStatus;
  notes?: string;
  productId?: string;
  productName?: string;
  hooks?: string[];
  talkingPoints?: string[];
  checklist: {
    batteryMemoryReady: boolean;
    lightingReady: boolean;
    swatchClean: boolean;
    audioMicReady: boolean;
  };
  createdAt: string;
}

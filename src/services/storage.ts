import { StashProduct, CoachSession, PlannerItem, VoiceDumpItem, GeneratedIdea } from '../types';

const STASH_KEY = 'beauty_buddy_stash_v1';
const COACH_SESSIONS_KEY = 'beauty_buddy_coach_sessions_v1';
const ACTIVE_COACH_KEY = 'beauty_buddy_active_coach_v1';
const PLANNER_KEY = 'beauty_buddy_planner_v1';
const VOICEDUMP_KEY = 'beauty_buddy_voicedump_v1';
const IDEAS_KEY = 'beauty_buddy_ideas_v1';

// Seed initial realistic Indonesian beauty products
const SEED_PRODUCTS: StashProduct[] = [
  {
    id: 'prod-1',
    name: 'Hydrating Lip Tint',
    brand: 'Aura Beauty',
    category: 'Lip product review',
    shade: 'Rosy Mauve',
    image: '/src/assets/images/beauty_lip_tint_1791731288784.jpg',
    personalExperience: 'Finish-nya glassy waktu awal swatch, terus setelah 15 menit ngeset jadi stain natural yang tahan 5 jam. Gak bikin garis bibir kering.',
    pros: ['Stain rata gak cuma di tengah', 'Gak pait', 'Bibir keliatan plumpy'],
    cons: ['Aplikator agak lentur', 'Harus re-apply setelah makan gorengan'],
    status: 'Favorit',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Hydrating Barrier Serum',
    brand: 'Aura Skin',
    category: 'Skincare before makeup',
    shade: 'Original 30ml',
    image: '/src/assets/images/beauty_serum_bottle_1791731303677.jpg',
    personalExperience: 'Dipakai 5 menit sebelum cushion bikin complexion nempel banget tanpa dry patches di cuping hidung. Tekstur gel cair adem.',
    pros: ['Cepat meresap', 'Gak pilling di bawah foundation', 'Redakan kemerahan'],
    cons: ['Pipet agak berat ditarik saat serum hampir habis'],
    status: 'Sedang dipakai',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Featherweight Velvet Cushion',
    brand: 'Aura Cosmetics',
    category: 'Makeup review',
    shade: '02 Neutral Sand',
    image: '/src/assets/images/beauty_cushion_compact_1791731318424.jpg',
    personalExperience: 'Coverage medium-to-high sekali tap. Finish satin matte yang tahan minyak 6 jam di cuaca panas Jakarta. Puff teardrop-nya presisi.',
    pros: ['Blur pori-pori halus', 'Gak oxidize turun warna', 'Ringan di kulit'],
    cons: ['Kalo kulit lagi dehidrasi parah perlu prep moisturizer lebih basah'],
    status: 'Favorit',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const SEED_PLANNER: PlannerItem[] = [
  {
    id: 'plan-1',
    title: 'Wear-Test 8 Jam Aura Lip Tint: Makan Soto & Kopi',
    targetDate: new Date().toISOString().split('T')[0],
    platform: 'TikTok',
    category: 'Lip product review',
    status: 'Siap direkam',
    productName: 'Aura Beauty Hydrating Lip Tint',
    productId: 'prod-1',
    notes: 'Vibe santai real-life wear test. Tunjukin transfer di sedotan kopi.',
    hooks: [
      'Jangan beli lip tint ini sebelum liat apa yang terjadi setelah aku makan soto panas!',
      'Nemuin lip tint lokal yang stain-nya gak cuma ngumpul di bibir tengah, beneran gak bikin crack.',
    ],
    talkingPoints: [
      'First swipe & tekstur jelly ringan',
      'Tes transfer di gelas kaca',
      'Kondisi bibir setelah makan kuah berminyak',
      'Verdict: worth it buat daily atau skip?',
    ],
    checklist: {
      batteryMemoryReady: true,
      lightingReady: true,
      swatchClean: false,
      audioMicReady: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    title: 'Skincare Prep Anti-Pilling Buat Cushion Awet Seharian',
    targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    platform: 'Instagram Reels',
    category: 'Skincare before makeup',
    status: 'Ide',
    productName: 'Aura Barrier Serum + Cushion',
    notes: 'Fokus ke edukasi durasi jeda skincare sebelum makeup.',
    checklist: {
      batteryMemoryReady: false,
      lightingReady: false,
      swatchClean: false,
      audioMicReady: false,
    },
    createdAt: new Date().toISOString(),
  },
];

export const storage = {
  // Stash
  getProducts(): StashProduct[] {
    try {
      const data = localStorage.getItem(STASH_KEY);
      if (!data) {
        localStorage.setItem(STASH_KEY, JSON.stringify(SEED_PRODUCTS));
        return SEED_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_PRODUCTS;
    }
  },

  saveProducts(products: StashProduct[]): void {
    localStorage.setItem(STASH_KEY, JSON.stringify(products));
  },

  addProduct(product: StashProduct): void {
    const list = this.getProducts();
    list.unshift(product);
    this.saveProducts(list);
  },

  updateProduct(product: StashProduct): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      list[idx] = product;
      this.saveProducts(list);
    }
  },

  deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(list);
  },

  // Active Coach Session
  getActiveCoach(): CoachSession | null {
    try {
      const data = localStorage.getItem(ACTIVE_COACH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveCoach(session: CoachSession | null): void {
    if (!session) {
      localStorage.removeItem(ACTIVE_COACH_KEY);
    } else {
      localStorage.setItem(ACTIVE_COACH_KEY, JSON.stringify(session));
      // Also sync to history sessions
      this.saveCoachSessionHistory(session);
    }
  },

  getCoachHistory(): CoachSession[] {
    try {
      const data = localStorage.getItem(COACH_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCoachSessionHistory(session: CoachSession): void {
    const list = this.getCoachHistory();
    const idx = list.findIndex((s) => s.id === session.id);
    if (idx !== -1) {
      list[idx] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(COACH_SESSIONS_KEY, JSON.stringify(list));
  },

  // Planner
  getPlannerItems(): PlannerItem[] {
    try {
      const data = localStorage.getItem(PLANNER_KEY);
      if (!data) {
        localStorage.setItem(PLANNER_KEY, JSON.stringify(SEED_PLANNER));
        return SEED_PLANNER;
      }
      return JSON.parse(data);
    } catch {
      return SEED_PLANNER;
    }
  },

  savePlannerItems(items: PlannerItem[]): void {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(items));
  },

  addPlannerItem(item: PlannerItem): void {
    const list = this.getPlannerItems();
    list.unshift(item);
    this.savePlannerItems(list);
  },

  updatePlannerItem(item: PlannerItem): void {
    const list = this.getPlannerItems();
    const idx = list.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
      this.savePlannerItems(list);
    }
  },

  deletePlannerItem(id: string): void {
    const list = this.getPlannerItems().filter((i) => i.id !== id);
    this.savePlannerItems(list);
  },

  // Voice Dump
  getVoiceDumps(): VoiceDumpItem[] {
    try {
      const data = localStorage.getItem(VOICEDUMP_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveVoiceDumps(items: VoiceDumpItem[]): void {
    localStorage.setItem(VOICEDUMP_KEY, JSON.stringify(items));
  },

  addVoiceDump(item: VoiceDumpItem): void {
    const list = this.getVoiceDumps();
    list.unshift(item);
    this.saveVoiceDumps(list);
  },

  deleteVoiceDump(id: string): void {
    const list = this.getVoiceDumps().filter((i) => i.id !== id);
    this.saveVoiceDumps(list);
  },

  // Saved Ideas
  getSavedIdeas(): GeneratedIdea[] {
    try {
      const data = localStorage.getItem(IDEAS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveIdeas(ideas: GeneratedIdea[]): void {
    localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
  },

  addSavedIdea(idea: GeneratedIdea): void {
    const list = this.getSavedIdeas();
    list.unshift(idea);
    this.saveIdeas(list);
  },

  // Export / Import
  exportAllData(): string {
    return JSON.stringify(
      {
        stash: this.getProducts(),
        coachHistory: this.getCoachHistory(),
        planner: this.getPlannerItems(),
        voiceDumps: this.getVoiceDumps(),
        savedIdeas: this.getSavedIdeas(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.stash) this.saveProducts(parsed.stash);
      if (parsed.planner) this.savePlannerItems(parsed.planner);
      if (parsed.voiceDumps) this.saveVoiceDumps(parsed.voiceDumps);
      if (parsed.savedIdeas) this.saveIdeas(parsed.savedIdeas);
      if (parsed.coachHistory) {
        localStorage.setItem(COACH_SESSIONS_KEY, JSON.stringify(parsed.coachHistory));
      }
      return true;
    } catch {
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.setItem(STASH_KEY, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(PLANNER_KEY, JSON.stringify(SEED_PLANNER));
    localStorage.removeItem(ACTIVE_COACH_KEY);
    localStorage.removeItem(COACH_SESSIONS_KEY);
    localStorage.removeItem(VOICEDUMP_KEY);
    localStorage.removeItem(IDEAS_KEY);
  },
};

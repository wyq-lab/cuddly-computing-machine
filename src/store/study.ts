"use client";
import { create } from "zustand";

interface KaodianItem {
  id: string;
  code: string;
  title: string;
  subject: string;
  content: string;
  keywords: string[];
  variant: { examType: string; answerTemplate: string } | null;
  questionCount: number;
  progress: { status: number; reciteLv: number; weight: number } | null;
  weight: number;
}

interface StudyState {
  user: { id: string; stage: string; baseLevel: string; planDays: number | null; planStart: string | null; streak: number } | null;
  kaodianList: KaodianItem[];
  selectedSubject: string | null;
  sessionId: string | null;
  sessionStart: number | null;

  setUser: (user: StudyState["user"]) => void;
  setKaodianList: (list: KaodianItem[]) => void;
  setSelectedSubject: (subject: string | null) => void;
  setSession: (sessionId: string, start: number) => void;
  clearSession: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  user: null,
  kaodianList: [],
  selectedSubject: null,
  sessionId: null,
  sessionStart: null,

  setUser: (user) => set({ user }),
  setKaodianList: (list) => set({ kaodianList: list }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  setSession: (sessionId, sessionStart) => set({ sessionId, sessionStart }),
  clearSession: () => set({ sessionId: null, sessionStart: null }),
}));

import { create } from 'zustand';
import {
  Card,
  CardCombination,
  GameMode,
  GamePhase,
  Question,
  QuestionPack,
  Team,
} from '../types/game';
import { BUILT_IN_QUESTION_PACKS } from '../data/defaultQuestions';
import { dealCards, evaluateCombination, canBeat } from '../engine/tienLenEngine';
import { soundService } from '../services/soundService';
import confetti from 'canvas-confetti';

interface GameState {
  // Cấu hình & Ngân hàng câu hỏi
  questionPacks: QuestionPack[];
  selectedPackId: string;
  isTeacherMode: boolean;
  teacherPin: string;

  // Trạng thái trận đấu
  phase: GamePhase;
  gameMode: GameMode;
  numTeams: number;
  teams: Team[];
  currentTeamIndex: number;
  currentQuestion: Question | null;
  tableCards: CardCombination | null;
  lastPlayedTeamId: string | null;
  usedQuestionIds: Set<string>;
  rankings: Team[]; // Đội đã về đích

  // Actions quản lý câu hỏi (Teacher)
  setTeacherMode: (val: boolean) => void;
  verifyTeacherPin: (pin: string) => boolean;
  addQuestionPack: (pack: QuestionPack) => void;
  updateQuestionPack: (pack: QuestionPack) => void;
  deleteQuestionPack: (packId: string) => void;
  selectQuestionPack: (packId: string) => void;

  // Actions quản lý ván bài (Gameplay)
  startGame: (numTeams: number, mode: GameMode, packId?: string) => void;
  revealAnswer: () => void;
  handleAnswerResult: (isCorrect: boolean) => void;
  playSelectedCards: (cards: Card[]) => { success: boolean; message?: string };
  passTurn: (afterPlaying?: boolean) => void;
  resetGame: () => void;
}

const DEFAULT_TEAMS_DATA: Omit<Team, 'cards' | 'hasPassedTurn' | 'score'>[] = [
  { id: 'team-1', name: 'Đội Đỏ (Red Fire)', color: 'from-rose-600 to-red-700' },
  { id: 'team-2', name: 'Đội Lam (Blue Thunder)', color: 'from-sky-600 to-blue-700' },
  { id: 'team-3', name: 'Đội Lục (Green Emerald)', color: 'from-emerald-600 to-green-700' },
  { id: 'team-4', name: 'Đội Vàng (Golden Sun)', color: 'from-amber-500 to-yellow-600' },
];

export const useGameStore = create<GameState>((set, get) => {
  // Load question packs from localStorage or fallback
  const getStoredPacks = (): QuestionPack[] => {
    if (typeof window === 'undefined') return BUILT_IN_QUESTION_PACKS;
    try {
      const stored = localStorage.getItem('TIEN_LEN_QUESTION_PACKS');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return BUILT_IN_QUESTION_PACKS;
  };

  return {
    questionPacks: getStoredPacks(),
    selectedPackId: BUILT_IN_QUESTION_PACKS[0].id,
    isTeacherMode: false,
    teacherPin: '1234', // Mã PIN giáo viên mặc định

    phase: 'SETUP',
    gameMode: 'classroom',
    numTeams: 4,
    teams: [],
    currentTeamIndex: 0,
    currentQuestion: null,
    tableCards: null,
    lastPlayedTeamId: null,
    usedQuestionIds: new Set(),
    rankings: [],

    setTeacherMode: (val) => set({ isTeacherMode: val }),

    verifyTeacherPin: (pin) => {
      return pin === get().teacherPin;
    },

    addQuestionPack: (pack) => {
      const updated = [...get().questionPacks, pack];
      if (typeof window !== 'undefined') {
        localStorage.setItem('TIEN_LEN_QUESTION_PACKS', JSON.stringify(updated));
      }
      set({ questionPacks: updated });
    },

    updateQuestionPack: (pack) => {
      const updated = get().questionPacks.map(p => p.id === pack.id ? pack : p);
      if (typeof window !== 'undefined') {
        localStorage.setItem('TIEN_LEN_QUESTION_PACKS', JSON.stringify(updated));
      }
      set({ questionPacks: updated });
    },

    deleteQuestionPack: (packId) => {
      const updated = get().questionPacks.filter(p => p.id !== packId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('TIEN_LEN_QUESTION_PACKS', JSON.stringify(updated));
      }
      set({ questionPacks: updated });
    },

    selectQuestionPack: (packId) => set({ selectedPackId: packId }),

    startGame: (numTeams, mode, packId) => {
      const targetPackId = packId || get().selectedPackId;
      const pack = get().questionPacks.find(p => p.id === targetPackId) || get().questionPacks[0];
      const cardsPerTeam = mode === 'standard' ? 13 : 8;

      const { hands } = dealCards(numTeams, cardsPerTeam);

      const initialTeams: Team[] = [];
      for (let i = 0; i < numTeams; i++) {
        const meta = DEFAULT_TEAMS_DATA[i];
        initialTeams.push({
          id: meta.id,
          name: meta.name,
          color: meta.color,
          cards: hands[i],
          hasPassedTurn: false,
          score: 0,
        });
      }

      // Chọn câu hỏi đầu tiên
      const randomQ = pack.questions[Math.floor(Math.random() * pack.questions.length)];

      set({
        phase: 'QUESTION',
        gameMode: mode,
        numTeams,
        teams: initialTeams,
        currentTeamIndex: 0,
        currentQuestion: randomQ,
        tableCards: null,
        lastPlayedTeamId: null,
        usedQuestionIds: new Set([randomQ.id]),
        rankings: [],
      });
    },

    revealAnswer: () => {
      set({ phase: 'ANSWER_REVEALED' });
    },

    handleAnswerResult: (isCorrect: boolean) => {
      const state = get();

      if (isCorrect) {
        // Trả lời ĐÚNG -> Cộng điểm, mở bài để đội ra quyết định
        soundService.playCorrect();
        const updatedTeams = state.teams.map((t, idx) =>
          idx === state.currentTeamIndex ? { ...t, score: t.score + 10 } : t
        );
        set({ teams: updatedTeams, phase: 'PLAYING_CARDS' });
      } else {
        // Trả lời SAI -> Mất lượt ngay lập tức, chuyển sang đội kế tiếp
        soundService.playWrong();
        get().passTurn();
      }
    },

    playSelectedCards: (cards: Card[]) => {
      const state = get();
      const currentTeam = state.teams[state.currentTeamIndex];
      const combo = evaluateCombination(cards);

      if (combo.type === 'INVALID') {
        return { success: false, message: 'Tổ hợp bài không hợp lệ!' };
      }

      // Kiểm tra có chặn được bài trên bàn không
      const currentTable = state.tableCards || { type: 'INVALID', cards: [], highestCard: {} as Card };
      if (!canBeat(currentTable, combo)) {
        return { success: false, message: 'Bài này không chặn được bài trên bàn!' };
      }

      // Đánh bài hợp lệ
      if (combo.type === 'FOUR_OF_A_KIND' || combo.type === 'THREE_PAIRS_SEQUENCE' || combo.type === 'FOUR_PAIRS_SEQUENCE') {
        soundService.playSlam();
      } else {
        soundService.playCardPlay();
      }

      // Trừ bài của đội
      const playedCardIds = new Set(cards.map(c => c.id));
      const remainingCards = currentTeam.cards.filter(c => !playedCardIds.has(c.id));

      const isFinished = remainingCards.length === 0;
      let newRankings = [...state.rankings];

      if (isFinished) {
        soundService.playVictory();
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        newRankings.push({ ...currentTeam, cards: [], rank: newRankings.length + 1 });
      }

      const updatedTeams = state.teams.map((t, idx) => {
        if (idx === state.currentTeamIndex) {
          return {
            ...t,
            cards: remainingCards,
            rank: isFinished ? newRankings.length : undefined,
          };
        }
        return t;
      });

      // Kiểm tra xem trận đấu đã kết thúc chưa (nếu chỉ còn 1 đội còn bài)
      const teamsWithCards = updatedTeams.filter(t => t.cards.length > 0);
      if (teamsWithCards.length <= 1) {
        // Hoàn tất trận đấu
        if (teamsWithCards.length === 1) {
          newRankings.push({ ...teamsWithCards[0], rank: newRankings.length + 1 });
        }
        set({
          teams: updatedTeams,
          tableCards: combo,
          lastPlayedTeamId: currentTeam.id,
          rankings: newRankings,
          phase: 'GAME_OVER',
        });
        return { success: true };
      }

      // Chuyển lượt sang câu hỏi tiếp theo cho đội kế tiếp
      set({
        teams: updatedTeams,
        tableCards: combo,
        lastPlayedTeamId: currentTeam.id,
        rankings: newRankings,
      });

      get().passTurn(true); // true = vừa đánh bài thành công, chuyển lượt tiếp theo
      return { success: true };
    },

    passTurn: (afterPlaying = false) => {
      const state = get();

      let updatedTeams = [...state.teams];
      if (!afterPlaying) {
        // Đội chủ động bỏ lượt hoặc trả lời sai -> đánh dấu bỏ lượt vòng này
        updatedTeams = updatedTeams.map((t, idx) =>
          idx === state.currentTeamIndex ? { ...t, hasPassedTurn: true } : t
        );
      }

      // Tìm đội tiếp theo chưa hết bài và chưa bỏ lượt
      let nextIndex = (state.currentTeamIndex + 1) % state.numTeams;
      let loopCount = 0;

      while (loopCount < state.numTeams) {
        const candidate = updatedTeams[nextIndex];
        // Đội còn bài và chưa bỏ lượt
        if (candidate.cards.length > 0 && !candidate.hasPassedTurn) {
          break;
        }
        nextIndex = (nextIndex + 1) % state.numTeams;
        loopCount++;
      }

      // Kiểm tra xem tất cả các đội khác đã bỏ lượt chưa -> Mở vòng mới
      const activeTeamsInRound = updatedTeams.filter(t => t.cards.length > 0 && !t.hasPassedTurn);

      let nextTableCards = state.tableCards;
      if (activeTeamsInRound.length <= 1) {
        // Reset vòng chơi mới: xóa bài bàn, reset hasPassedTurn
        updatedTeams = updatedTeams.map(t => ({ ...t, hasPassedTurn: false }));
        nextTableCards = null;

        // Người mở vòng mới là người vừa đánh lá cuối cùng (nếu còn bài), hoặc đội kế tiếp
        const lastTeamIdx = updatedTeams.findIndex(t => t.id === state.lastPlayedTeamId);
        if (lastTeamIdx !== -1 && updatedTeams[lastTeamIdx].cards.length > 0) {
          nextIndex = lastTeamIdx;
        } else {
          // nếu đội đó đã hết bài, tìm đội còn bài kế tiếp
          while (updatedTeams[nextIndex].cards.length === 0) {
            nextIndex = (nextIndex + 1) % state.numTeams;
          }
        }
      }

      // Chọn câu hỏi tiếng Anh tiếp theo
      const pack = state.questionPacks.find(p => p.id === state.selectedPackId) || state.questionPacks[0];
      const unusedQuestions = pack.questions.filter(q => !state.usedQuestionIds.has(q.id));
      let nextQ: Question;
      let nextUsedSet = new Set(state.usedQuestionIds);

      if (unusedQuestions.length === 0) {
        // Đã dùng hết câu hỏi, reset danh sách câu hỏi đã dùng
        nextQ = pack.questions[Math.floor(Math.random() * pack.questions.length)];
        nextUsedSet = new Set([nextQ.id]);
      } else {
        nextQ = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
        nextUsedSet.add(nextQ.id);
      }

      set({
        teams: updatedTeams,
        tableCards: nextTableCards,
        currentTeamIndex: nextIndex,
        currentQuestion: nextQ,
        phase: 'QUESTION',
        usedQuestionIds: nextUsedSet,
      });
    },

    resetGame: () => {
      set({
        phase: 'SETUP',
        teams: [],
        tableCards: null,
        currentQuestion: null,
        rankings: [],
      });
    },
  };
});

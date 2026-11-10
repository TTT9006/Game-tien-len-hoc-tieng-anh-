export type Suit = 'spade' | 'club' | 'diamond' | 'heart'; // Bích (♠), Chuồn (♣), Rô (♦), Cơ (♥)

export type Rank = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15; // 11=J, 12=Q, 13=K, 14=A, 15=2

export interface Card {
  id: string; // e.g. "3-spade", "15-heart"
  rank: Rank;
  suit: Suit;
}

export type CombinationType =
  | 'SINGLE'               // Lá rác (1 lá)
  | 'PAIR'                 // Đôi (2 lá cùng rank)
  | 'TRIPLE'               // Ba (3 lá cùng rank)
  | 'FOUR_OF_A_KIND'       // Tứ quý (4 lá cùng rank)
  | 'STRAIGHT'             // Sảnh (>= 3 lá liên tiếp, không chứa 2)
  | 'THREE_PAIRS_SEQUENCE' // 3 đôi thông
  | 'FOUR_PAIRS_SEQUENCE'  // 4 đôi thông
  | 'INVALID';

export interface CardCombination {
  type: CombinationType;
  cards: Card[];
  highestCard: Card; // Lá quyết định giá trị so sánh
  length?: number;   // Dành cho sảnh (độ dài sảnh)
}

export type QuestionType = 'flashcard' | 'multiple_choice';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;        // Nội dung câu hỏi (tiếng Anh)
  answer: string;        // Đáp án chuẩn
  explanation?: string;  // Giải thích ngữ pháp / từ vựng
  options?: string[];    // Các lựa chọn cho trắc nghiệm (A, B, C, D)
  imageUrl?: string;     // Hình ảnh minh họa (nếu có)
  category?: string;     // Chủ đề: Grammar, Vocab, v.v.
}

export interface QuestionPack {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isBuiltIn?: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  cards: Card[];
  hasPassedTurn: boolean; // Bỏ lượt trong vòng hiện tại
  rank?: number;          // Thứ hạng về (1: Nhất, 2: Nhì, ...)
  score: number;          // Điểm cộng thêm
}

export type GameMode = 'standard' | 'classroom'; // 13 lá hoặc 6-8 lá

export type GamePhase =
  | 'SETUP'           // Chọn đội, chế độ chơi, bộ câu hỏi
  | 'QUESTION'        // Hiện popup câu hỏi cho đội hiện tại
  | 'ANSWER_REVEALED' // Đã lật đáp án, giáo viên chấm Đúng / Sai
  | 'PLAYING_CARDS'   // Đội đúng, mở bài để chọn đánh bài hoặc bỏ lượt
  | 'ROUND_ENDED'     // Vòng đánh bài kết thúc (tất cả đội khác bỏ lượt)
  | 'GAME_OVER';      // Trận đấu kết thúc, tổng kết xếp hạng

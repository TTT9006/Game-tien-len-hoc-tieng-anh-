import { Card, Rank, Suit, CardCombination } from '../types/game';

export const SUITS: Suit[] = ['spade', 'club', 'diamond', 'heart'];
export const RANKS: Rank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export const SUIT_POWER: Record<Suit, number> = {
  spade: 1,   // Bích (♠) thấp nhất
  club: 2,    // Chuồn (♣)
  diamond: 3, // Rô (♦)
  heart: 4,   // Cơ (♥) cao nhất
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spade: '♠',
  club: '♣',
  diamond: '♦',
  heart: '♥',
};

export const SUIT_COLORS: Record<Suit, string> = {
  spade: 'text-slate-900 dark:text-slate-100',
  club: 'text-emerald-700 dark:text-emerald-400',
  diamond: 'text-rose-600 dark:text-rose-400',
  heart: 'text-rose-600 dark:text-rose-500',
};

export const RANK_NAMES: Record<Rank, string> = {
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
  15: '2',
};

/**
 * So sánh 2 lá bài theo luật Tiến Lên Miền Nam:
 * Rank quyết định trước (3 < 4 < ... < K < A < 2), nếu bằng rank thì so sánh Chất (Bích < Chuồn < Rô < Cơ)
 */
export function compareCards(a: Card, b: Card): number {
  if (a.rank !== b.rank) {
    return a.rank - b.rank;
  }
  return SUIT_POWER[a.suit] - SUIT_POWER[b.suit];
}

/**
 * Sắp xếp các lá bài theo thứ tự tăng dần
 */
export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort(compareCards);
}

/**
 * Tạo một bộ bài Tây đầy đủ 52 lá
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({
        id: `${rank}-${suit}`,
        rank,
        suit,
      });
    }
  }
  return deck;
}

/**
 * Thuật toán sinh số ngẫu nhiên an toàn (Cryptographically Secure Pseudo-Random Number Generator nếu có window.crypto)
 */
function secureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return Math.random();
}

/**
 * Xáo trộn bộ bài ngẫu nhiên tuyệt đối (Fisher-Yates shuffle qua nhiều lượt xáo)
 */
export function shuffleDeck(deck: Card[], passes: number = 3): Card[] {
  let shuffled = [...deck];
  for (let p = 0; p < passes; p++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(secureRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  return shuffled;
}

/**
 * Chia bài cho các đội
 * @param numTeams Số đội (2 - 4)
 * @param cardsPerTeam Số lá mỗi đội (13 cho standard, 6-8 cho classroom)
 */
export function dealCards(numTeams: number, cardsPerTeam: number): { hands: Card[][]; remainingDeck: Card[] } {
  const deck = shuffleDeck(createDeck());
  const hands: Card[][] = [];

  for (let t = 0; t < numTeams; t++) {
    hands.push([]);
  }

  for (let i = 0; i < cardsPerTeam; i++) {
    for (let t = 0; t < numTeams; t++) {
      const card = deck.pop();
      if (card) {
        hands[t].push(card);
      }
    }
  }

  // Sắp xếp bài của từng đội
  for (let t = 0; t < numTeams; t++) {
    hands[t] = sortCards(hands[t]);
  }

  return { hands, remainingDeck: deck };
}

/**
 * Phân tích và nhận diện tổ hợp bài Tiến Lên Miền Nam
 */
export function evaluateCombination(cards: Card[]): CardCombination {
  if (!cards || cards.length === 0) {
    return { type: 'INVALID', cards: [], highestCard: {} as Card };
  }

  const sorted = sortCards(cards);
  const n = sorted.length;
  const highestCard = sorted[n - 1];

  // 1. Lá rác (1 lá)
  if (n === 1) {
    return { type: 'SINGLE', cards: sorted, highestCard };
  }

  // 2. Đôi (2 lá cùng rank)
  if (n === 2 && sorted[0].rank === sorted[1].rank) {
    return { type: 'PAIR', cards: sorted, highestCard };
  }

  // 3. Ba lá (3 lá cùng rank)
  if (n === 3 && sorted[0].rank === sorted[1].rank && sorted[1].rank === sorted[2].rank) {
    return { type: 'TRIPLE', cards: sorted, highestCard };
  }

  // 4. Tứ quý (4 lá cùng rank)
  if (
    n === 4 &&
    sorted[0].rank === sorted[1].rank &&
    sorted[1].rank === sorted[2].rank &&
    sorted[2].rank === sorted[3].rank
  ) {
    return { type: 'FOUR_OF_A_KIND', cards: sorted, highestCard };
  }

  // 5. Kiểm tra sảnh (>= 3 lá liên tiếp, không chứa lá 2)
  if (n >= 3) {
    const hasTwo = sorted.some(c => c.rank === 15);
    if (!hasTwo) {
      let isStraight = true;
      for (let i = 0; i < n - 1; i++) {
        if (sorted[i + 1].rank !== sorted[i].rank + 1) {
          isStraight = false;
          break;
        }
      }
      if (isStraight) {
        return { type: 'STRAIGHT', cards: sorted, highestCard, length: n };
      }
    }
  }

  // 6. Kiểm tra Đôi thông (3 đôi thông = 6 lá, 4 đôi thông = 8 lá)
  if (n === 6 || n === 8) {
    const numPairs = n / 2;
    let isPairSequence = true;
    const pairRanks: number[] = [];

    for (let i = 0; i < n; i += 2) {
      if (sorted[i].rank !== sorted[i + 1].rank) {
        isPairSequence = false;
        break;
      }
      pairRanks.push(sorted[i].rank);
    }

    // Đôi thông không được chứa 2 (rank 15)
    if (isPairSequence && !pairRanks.includes(15)) {
      for (let i = 0; i < pairRanks.length - 1; i++) {
        if (pairRanks[i + 1] !== pairRanks[i] + 1) {
          isPairSequence = false;
          break;
        }
      }

      if (isPairSequence) {
        if (numPairs === 3) {
          return { type: 'THREE_PAIRS_SEQUENCE', cards: sorted, highestCard };
        } else if (numPairs === 4) {
          return { type: 'FOUR_PAIRS_SEQUENCE', cards: sorted, highestCard };
        }
      }
    }
  }

  return { type: 'INVALID', cards: sorted, highestCard };
}

/**
 * Kiểm tra xem tổ hợp bài mới (incoming) có chặn được bài hiện tại trên bàn (current) hay không.
 * Đầy đủ luật Tiến Lên Miền Nam và luật chặt heo / chặt hàng đặc biệt.
 */
export function canBeat(current: CardCombination, incoming: CardCombination): boolean {
  if (incoming.type === 'INVALID') {
    return false;
  }

  // Nếu trên bàn chưa có bài (lượt đầu hoặc mở vòng mới), bất kỳ tổ hợp hợp lệ nào cũng được đánh
  if (current.type === 'INVALID' || current.cards.length === 0) {
    return true;
  }

  // --- CÁC TRƯỜNG HỢP CÙNG LOẠI TỔ HỢP ---

  // 1. Cùng là Đơn: So sánh giá trị lá cao hơn (hoặc cùng rank thì so chất)
  if (current.type === 'SINGLE' && incoming.type === 'SINGLE') {
    return compareCards(incoming.highestCard, current.highestCard) > 0;
  }

  // 2. Cùng là Đôi: So sánh lá cao nhất trong đôi
  if (current.type === 'PAIR' && incoming.type === 'PAIR') {
    return compareCards(incoming.highestCard, current.highestCard) > 0;
  }

  // 3. Cùng là Ba: So sánh lá cao nhất
  if (current.type === 'TRIPLE' && incoming.type === 'TRIPLE') {
    return compareCards(incoming.highestCard, current.highestCard) > 0;
  }

  // 4. Cùng là Sảnh: Phải cùng độ dài, so sánh lá cao nhất của sảnh
  if (current.type === 'STRAIGHT' && incoming.type === 'STRAIGHT') {
    if (current.length !== incoming.length) {
      return false;
    }
    return compareCards(incoming.highestCard, current.highestCard) > 0;
  }

  // 5. Cùng là 3 Đôi thông
  if (current.type === 'THREE_PAIRS_SEQUENCE' && incoming.type === 'THREE_PAIRS_SEQUENCE') {
    return compareCards(incoming.highestCard, current.highestCard) > 0;
  }

  // 6. Cùng là Tứ quý
  if (current.type === 'FOUR_OF_A_KIND' && incoming.type === 'FOUR_OF_A_KIND') {
    return compareCards(incoming.highestCard, current.highestCard) > 0;
  }

  // 7. Cùng là 4 Đôi thông
  if (current.type === 'FOUR_PAIRS_SEQUENCE' && incoming.type === 'FOUR_PAIRS_SEQUENCE') {
    return compareCards(incoming.highestCard, current.highestCard) > 0;
  }

  // --- CÁC TRƯỜNG HỢP CHẶT HÀNG ĐẶC BIỆT ---

  // A. Chặt 1 Heo (Lá 2)
  if (current.type === 'SINGLE' && current.highestCard.rank === 15) {
    // 3 đôi thông chặt 1 heo
    if (incoming.type === 'THREE_PAIRS_SEQUENCE') return true;
    // Tứ quý chặt 1 heo
    if (incoming.type === 'FOUR_OF_A_KIND') return true;
    // 4 đôi thông chặt 1 heo
    if (incoming.type === 'FOUR_PAIRS_SEQUENCE') return true;
  }

  // B. Chặt Đôi Heo (Đôi 2)
  if (current.type === 'PAIR' && current.highestCard.rank === 15) {
    // Tứ quý chặt đôi heo
    if (incoming.type === 'FOUR_OF_A_KIND') return true;
    // 4 đôi thông chặt đôi heo
    if (incoming.type === 'FOUR_PAIRS_SEQUENCE') return true;
  }

  // C. Chặt 3 Đôi Thông
  if (current.type === 'THREE_PAIRS_SEQUENCE') {
    // Tứ quý chặt 3 đôi thông
    if (incoming.type === 'FOUR_OF_A_KIND') return true;
    // 4 đôi thông chặt 3 đôi thông
    if (incoming.type === 'FOUR_PAIRS_SEQUENCE') return true;
  }

  // D. Chặt Tứ Quý
  if (current.type === 'FOUR_OF_A_KIND') {
    // 4 đôi thông chặt tứ quý
    if (incoming.type === 'FOUR_PAIRS_SEQUENCE') return true;
  }

  return false;
}

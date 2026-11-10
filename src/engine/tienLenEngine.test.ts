import { describe, it, expect } from 'vitest';
import {
  createDeck,
  compareCards,
  evaluateCombination,
  canBeat,
  dealCards,
} from './tienLenEngine';
import { Card } from '../types/game';

describe('Tien Len Engine Core Logic', () => {
  it('should generate a full 52-card deck', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('should compare cards accurately according to Tien Len rules', () => {
    // 3 Bích vs 3 Cơ -> 3 Cơ thắng
    const card3Spade: Card = { id: '3-spade', rank: 3, suit: 'spade' };
    const card3Heart: Card = { id: '3-heart', rank: 3, suit: 'heart' };
    expect(compareCards(card3Heart, card3Spade)).toBeGreaterThan(0);

    // Át Bích vs 2 Bích -> 2 Bích thắng
    const cardAceSpade: Card = { id: '14-spade', rank: 14, suit: 'spade' };
    const card2Spade: Card = { id: '15-spade', rank: 15, suit: 'spade' };
    expect(compareCards(card2Spade, cardAceSpade)).toBeGreaterThan(0);

    // 2 Chuồn vs 2 Cơ -> 2 Cơ thắng
    const card2Club: Card = { id: '15-club', rank: 15, suit: 'club' };
    const card2Heart: Card = { id: '15-heart', rank: 15, suit: 'heart' };
    expect(compareCards(card2Heart, card2Club)).toBeGreaterThan(0);
  });

  it('should deal cards evenly among teams', () => {
    const result = dealCards(4, 13);
    expect(result.hands).toHaveLength(4);
    expect(result.hands[0]).toHaveLength(13);
    expect(result.hands[1]).toHaveLength(13);
    expect(result.hands[2]).toHaveLength(13);
    expect(result.hands[3]).toHaveLength(13);
    expect(result.remainingDeck).toHaveLength(0);

    // Fast Classroom Mode: 3 teams, 8 cards each
    const fastResult = dealCards(3, 8);
    expect(fastResult.hands).toHaveLength(3);
    expect(fastResult.hands[0]).toHaveLength(8);
    expect(fastResult.remainingDeck).toHaveLength(52 - 24);
  });

  it('should identify valid combinations: Singles, Pairs, Triples, Quads, Straights', () => {
    // Single
    const single = evaluateCombination([{ id: '7-spade', rank: 7, suit: 'spade' }]);
    expect(single.type).toBe('SINGLE');

    // Pair
    const pair = evaluateCombination([
      { id: '10-club', rank: 10, suit: 'club' },
      { id: '10-diamond', rank: 10, suit: 'diamond' },
    ]);
    expect(pair.type).toBe('PAIR');

    // Triple
    const triple = evaluateCombination([
      { id: '12-spade', rank: 12, suit: 'spade' },
      { id: '12-club', rank: 12, suit: 'club' },
      { id: '12-heart', rank: 12, suit: 'heart' },
    ]);
    expect(triple.type).toBe('TRIPLE');

    // Four of a kind
    const quad = evaluateCombination([
      { id: '8-spade', rank: 8, suit: 'spade' },
      { id: '8-club', rank: 8, suit: 'club' },
      { id: '8-diamond', rank: 8, suit: 'diamond' },
      { id: '8-heart', rank: 8, suit: 'heart' },
    ]);
    expect(quad.type).toBe('FOUR_OF_A_KIND');

    // Straight: 4-5-6-7
    const straight = evaluateCombination([
      { id: '4-spade', rank: 4, suit: 'spade' },
      { id: '5-diamond', rank: 5, suit: 'diamond' },
      { id: '6-club', rank: 6, suit: 'club' },
      { id: '7-heart', rank: 7, suit: 'heart' },
    ]);
    expect(straight.type).toBe('STRAIGHT');
    expect(straight.length).toBe(4);

    // Invalid straight containing 2: K-A-2 is INVALID in Tien Len
    const invalidStraight = evaluateCombination([
      { id: '13-spade', rank: 13, suit: 'spade' },
      { id: '14-diamond', rank: 14, suit: 'diamond' },
      { id: '15-heart', rank: 15, suit: 'heart' },
    ]);
    expect(invalidStraight.type).toBe('INVALID');
  });

  it('should identify 3-pair and 4-pair sequences (Đôi thông)', () => {
    // 3 pairs: 5-5, 6-6, 7-7
    const threePairs = evaluateCombination([
      { id: '5-spade', rank: 5, suit: 'spade' },
      { id: '5-club', rank: 5, suit: 'club' },
      { id: '6-diamond', rank: 6, suit: 'diamond' },
      { id: '6-heart', rank: 6, suit: 'heart' },
      { id: '7-spade', rank: 7, suit: 'spade' },
      { id: '7-heart', rank: 7, suit: 'heart' },
    ]);
    expect(threePairs.type).toBe('THREE_PAIRS_SEQUENCE');

    // 4 pairs: 8-8, 9-9, 10-10, J-J
    const fourPairs = evaluateCombination([
      { id: '8-spade', rank: 8, suit: 'spade' },
      { id: '8-heart', rank: 8, suit: 'heart' },
      { id: '9-club', rank: 9, suit: 'club' },
      { id: '9-diamond', rank: 9, suit: 'diamond' },
      { id: '10-spade', rank: 10, suit: 'spade' },
      { id: '10-heart', rank: 10, suit: 'heart' },
      { id: '11-club', rank: 11, suit: 'club' },
      { id: '11-diamond', rank: 11, suit: 'diamond' },
    ]);
    expect(fourPairs.type).toBe('FOUR_PAIRS_SEQUENCE');
  });

  it('should validate special beating rules (Chặt Heo & Chặt Hàng)', () => {
    const singlePig = evaluateCombination([{ id: '15-spade', rank: 15, suit: 'spade' }]);
    const redPig = evaluateCombination([{ id: '15-heart', rank: 15, suit: 'heart' }]);
    const pairOfPigs = evaluateCombination([
      { id: '15-spade', rank: 15, suit: 'spade' },
      { id: '15-club', rank: 15, suit: 'club' },
    ]);

    const quad = evaluateCombination([
      { id: '9-spade', rank: 9, suit: 'spade' },
      { id: '9-club', rank: 9, suit: 'club' },
      { id: '9-diamond', rank: 9, suit: 'diamond' },
      { id: '9-heart', rank: 9, suit: 'heart' },
    ]);

    const threePairs = evaluateCombination([
      { id: '7-spade', rank: 7, suit: 'spade' },
      { id: '7-club', rank: 7, suit: 'club' },
      { id: '8-diamond', rank: 8, suit: 'diamond' },
      { id: '8-heart', rank: 8, suit: 'heart' },
      { id: '9-spade', rank: 9, suit: 'spade' },
      { id: '9-heart', rank: 9, suit: 'heart' },
    ]);

    const fourPairs = evaluateCombination([
      { id: '6-spade', rank: 6, suit: 'spade' },
      { id: '6-heart', rank: 6, suit: 'heart' },
      { id: '7-spade', rank: 7, suit: 'spade' },
      { id: '7-heart', rank: 7, suit: 'heart' },
      { id: '8-spade', rank: 8, suit: 'spade' },
      { id: '8-heart', rank: 8, suit: 'heart' },
      { id: '9-spade', rank: 9, suit: 'spade' },
      { id: '9-heart', rank: 9, suit: 'heart' },
    ]);

    // 2 Cơ chặn 2 Bích
    expect(canBeat(singlePig, redPig)).toBe(true);

    // 3 Đôi thông chặt được 1 Heo
    expect(canBeat(singlePig, threePairs)).toBe(true);
    expect(canBeat(redPig, threePairs)).toBe(true);

    // 3 Đôi thông KHÔNG chặt được Đôi Heo
    expect(canBeat(pairOfPigs, threePairs)).toBe(false);

    // Tứ quý chặt được 1 Heo, Đôi Heo, và 3 Đôi thông
    expect(canBeat(singlePig, quad)).toBe(true);
    expect(canBeat(pairOfPigs, quad)).toBe(true);
    expect(canBeat(threePairs, quad)).toBe(true);

    // 4 Đôi thông chặt được Tứ quý và Đôi Heo
    expect(canBeat(quad, fourPairs)).toBe(true);
    expect(canBeat(pairOfPigs, fourPairs)).toBe(true);
  });
});

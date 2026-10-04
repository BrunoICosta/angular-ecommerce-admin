import { SeededRandom } from './seeded-random';

describe('SeededRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = new SeededRandom(42);
    const b = new SeededRandom(42);
    const seqA = Array.from({ length: 5 }, () => a.next());
    const seqB = Array.from({ length: 5 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    expect(new SeededRandom(1).next()).not.toEqual(new SeededRandom(2).next());
  });

  it('keeps int() inside the inclusive range', () => {
    const rng = new SeededRandom(7);
    const values = Array.from({ length: 500 }, () => rng.int(3, 6));
    expect(Math.min(...values)).toBe(3);
    expect(Math.max(...values)).toBe(6);
  });

  it('samples distinct items', () => {
    const rng = new SeededRandom(9);
    const sample = rng.sample([1, 2, 3, 4, 5], 3);
    expect(sample.length).toBe(3);
    expect(new Set(sample).size).toBe(3);
  });
});

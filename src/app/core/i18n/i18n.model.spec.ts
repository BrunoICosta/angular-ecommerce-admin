import { detectLanguage, isLanguage } from './i18n.model';

describe('detectLanguage', () => {
  it('prefers the saved choice', () => {
    expect(detectLanguage('en', ['pt-BR'])).toBe('en');
    expect(detectLanguage('pt-BR', ['en-US'])).toBe('pt-BR');
  });

  it('ignores an invalid saved value', () => {
    expect(detectLanguage('fr', ['en-GB'])).toBe('en');
  });

  it('maps any Portuguese browser language to pt-BR', () => {
    expect(detectLanguage(null, ['pt-PT', 'en'])).toBe('pt-BR');
    expect(detectLanguage(null, ['PT'])).toBe('pt-BR');
  });

  it('maps every other browser language to English', () => {
    expect(detectLanguage(null, ['es-AR'])).toBe('en');
    expect(detectLanguage(null, ['de'])).toBe('en');
  });

  it('falls back to pt-BR without any hint', () => {
    expect(detectLanguage(null, [])).toBe('pt-BR');
    expect(detectLanguage(null, undefined)).toBe('pt-BR');
  });

  it('validates language codes', () => {
    expect(isLanguage('pt-BR')).toBeTrue();
    expect(isLanguage('pt')).toBeFalse();
    expect(isLanguage(undefined)).toBeFalse();
  });
});

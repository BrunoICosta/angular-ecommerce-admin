import { toDirection, toPageSize, toPositiveInt, toQueryParams } from './list-query.util';

describe('list-query.util', () => {
  it('parses positive integers with a fallback', () => {
    expect(toPositiveInt('3', 1)).toBe(3);
    expect(toPositiveInt('0', 1)).toBe(1);
    expect(toPositiveInt('abc', 1)).toBe(1);
    expect(toPositiveInt(undefined, 2)).toBe(2);
  });

  it('only accepts the offered page sizes', () => {
    expect(toPageSize('25')).toBe(25);
    expect(toPageSize('33')).toBe(10);
  });

  it('validates the sort direction', () => {
    expect(toDirection('desc', 'asc')).toBe('desc');
    expect(toDirection('sideways', 'asc')).toBe('asc');
  });

  it('drops defaults and empty values from the URL', () => {
    expect(
      toQueryParams(
        { page: 1, size: 25, q: '', sort: 'price', dir: null },
        { page: 1, size: 10, sort: 'name' },
      ),
    ).toEqual({ page: null, size: 25, q: null, sort: 'price', dir: null });
  });
});

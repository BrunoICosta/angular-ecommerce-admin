import {
  ListOptions,
  applyListQuery,
  compareValues,
  normalize,
  parseListQuery,
} from './list-query';

interface Row {
  id: number;
  name: string;
  price: number | null;
  tag: string;
}

const rows: Row[] = [
  { id: 1, name: 'Câmera', price: 300, tag: 'a' },
  { id: 2, name: 'abajur', price: 100, tag: 'b' },
  { id: 3, name: 'Bola', price: null, tag: 'a' },
  { id: 4, name: 'Cadeira', price: 200, tag: 'b' },
];

const options: ListOptions<Row> = {
  searchFields: ['name'],
  sortable: ['name', 'price'],
  defaultSort: { field: 'id', direction: 'asc' },
  filters: { tag: (row, value) => row.tag === value },
};

function query(params: Record<string, string>) {
  return parseListQuery(new Map(Object.entries(params).map(([k, v]) => [k, [v]])));
}

describe('list-query', () => {
  it('parses defaults and clamps the page size', () => {
    expect(query({})).toEqual(
      jasmine.objectContaining({ page: 0, pageSize: 10, sort: null, direction: 'asc' }),
    );
    expect(query({ pageSize: '5000', page: '-3' })).toEqual(
      jasmine.objectContaining({ page: 0, pageSize: 100 }),
    );
  });

  it('normalizes accents and case', () => {
    expect(normalize('Câmera ÁGUA')).toBe('camera agua');
  });

  it('searches ignoring accents', () => {
    const page = applyListQuery(rows, query({ q: 'camera' }), options);
    expect(page.items.map((r) => r.id)).toEqual([1]);
  });

  it('sorts with the pt-BR collator, case insensitive', () => {
    const page = applyListQuery(rows, query({ sort: 'name' }), options);
    expect(page.items.map((r) => r.name)).toEqual(['abajur', 'Bola', 'Cadeira', 'Câmera']);
  });

  it('keeps missing values last in both directions', () => {
    const asc = applyListQuery(rows, query({ sort: 'price', dir: 'asc' }), options);
    const desc = applyListQuery(rows, query({ sort: 'price', dir: 'desc' }), options);
    expect(asc.items.map((r) => r.id)).toEqual([2, 4, 1, 3]);
    expect(desc.items.map((r) => r.id)).toEqual([1, 4, 2, 3]);
  });

  it('ignores unknown sort fields and falls back to the default sort', () => {
    const page = applyListQuery(rows, query({ sort: 'tag', dir: 'desc' }), options);
    expect(page.items.map((r) => r.id)).toEqual([1, 2, 3, 4]);
  });

  it('applies filters and paginates', () => {
    const page = applyListQuery(rows, query({ tag: 'b', pageSize: '1', page: '1' }), options);
    expect(page).toEqual({ items: [rows[3]], total: 2, page: 1, pageSize: 1 });
  });

  it('compares numbers numerically and strings naturally', () => {
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues('item 2', 'item 10')).toBeLessThan(0);
  });
});

import pg from 'pg';
import pgtypes from '../src/index.js';

const connection = process.env.DATABASE_URL || 'postgresql://postgres@localhost/pg_custom_types';

const POSTGIS_TYPES = ['geometry', 'geography'];

function fetchTypes(uniqueKey, types) {
  return new Promise((resolve, reject) => {
    pgtypes(pgtypes.fetcher(pg, connection), uniqueKey, types, (err, oids) => {
      if (err) {
        return reject(err);
      }
      resolve(oids);
    });
  });
}

describe('custom types', () => {
  it('fetches postgis types', async () => {
    const oids = await fetchTypes('postgis', POSTGIS_TYPES);

    expect(typeof oids.geometry).toBe('number');
    expect(typeof oids.geography).toBe('number');

    expect(typeof pgtypes.getTypeOID('geometry', 'postgis')).toBe('number');
    expect(pgtypes.getTypeName(pgtypes.getTypeOID('geometry', 'postgis'), 'postgis')).toBe('geometry');
  });

  it('fails to fetch non-existent types', async () => {
    const oids = await fetchTypes('bogus', ['bogustype']);
    expect(oids.bogustype).toBeUndefined();
  });

  it('allowNull returns null for null values', () => {
    const parser = pgtypes.allowNull((v) => parseInt(v, 10));
    expect(parser(null)).toBeNull();
    expect(parser(undefined)).toBeNull();
    expect(parser('42')).toBe(42);
  });

  it('parseArray parses an array with the given parser', () => {
    const parseIntArray = pgtypes.parseArray((v) => parseInt(v, 10));
    expect(parseIntArray('{1,2,3}')).toEqual([1, 2, 3]);
  });

  it('parseArray returns null for null input', () => {
    const parseIntArray = pgtypes.parseArray((v) => parseInt(v, 10));
    expect(parseIntArray(null)).toBeNull();
  });
});

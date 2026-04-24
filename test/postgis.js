import pg from 'pg';
import { assert } from 'chai';
import pgtypes from '../src/index.js';

const connection = process.env.DATABASE_URL || 'postgresql://postgres@localhost/pg_custom_types';

const POSTGIS_TYPES = ['geometry', 'geography'];

describe('custom types', () => {
  it('fetches postgis types', function (done) {
    pgtypes(pgtypes.fetcher(pg, connection), 'postgis', POSTGIS_TYPES, (err, oids) => {
      if (err) {
        return done(err);
      }

      assert.isNumber(oids.geometry);
      assert.isNumber(oids.geography);

      assert.isNumber(pgtypes.getTypeOID('geometry', 'postgis'));
      assert.strictEqual(pgtypes.getTypeName(pgtypes.getTypeOID('geometry', 'postgis'), 'postgis'), 'geometry');

      done();
    });
  });

  it('fails to fetch non-existent types', function (done) {
    pgtypes(pgtypes.fetcher(pg, connection), 'bogus', ['bogustype'], (err, oids) => {
      if (err) {
        return done(err);
      }

      assert.isUndefined(oids.bogustype);

      done();
    });
  });

  it('allowNull returns null for null values', () => {
    const parser = pgtypes.allowNull((v) => parseInt(v, 10));
    assert.isNull(parser(null));
    assert.isNull(parser(undefined));
    assert.strictEqual(parser('42'), 42);
  });

  it('parseArray parses an array with the given parser', () => {
    const parseIntArray = pgtypes.parseArray((v) => parseInt(v, 10));
    const result = parseIntArray('{1,2,3}');
    assert.deepEqual(result, [1, 2, 3]);
  });

  it('parseArray returns null for null input', () => {
    const parseIntArray = pgtypes.parseArray((v) => parseInt(v, 10));
    assert.isNull(parseIntArray(null));
  });
});

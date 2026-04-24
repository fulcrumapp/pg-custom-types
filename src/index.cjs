const pgformat = require('pg-format');
const { parse: parseArray } = require('postgres-array');

const OIDS = {};
const NAMES = {};

function fetch(execute, uniqueKey, types, callback) {
  if (OIDS[uniqueKey]) {
    return callback(null, OIDS[uniqueKey]);
  }

  let sql = 'SELECT oid, typname AS name FROM pg_type WHERE typname IN (%L)';
  sql = pgformat(sql, types);

  execute(sql, (err, rows) => {
    if (err) {
      return callback(err);
    }

    OIDS[uniqueKey] = {};
    NAMES[uniqueKey] = {};

    for (const row of rows) {
      OIDS[uniqueKey][row.name] = +row.oid;
      NAMES[uniqueKey][+row.oid] = row.name;
    }

    callback(null, OIDS[uniqueKey]);
  });
}

fetch.fetcher = function (pg, connectionString) {
  const pool = new pg.Pool({ connectionString });

  return (sql, callback) => {
    pool.query(sql, (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result.rows);
    });
  };
};

fetch.names = NAMES;
fetch.oids = OIDS;

fetch.allowNull = function (parser) {
  return function (value) {
    if (value == null) {
      return null;
    }
    return parser(value);
  };
};

fetch.getTypeName = function (oid, key) {
  return NAMES[key][+oid];
};

fetch.getTypeOID = function (name, key) {
  return OIDS[key][name];
};

fetch.parseArray = function (parser) {
  return fetch.allowNull((value) => parseArray(value, fetch.allowNull(parser)));
};

module.exports = fetch;

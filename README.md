# pg-custom-types [![Build Status](https://travis-ci.org/zhm/pg-custom-types.svg?branch=master)](https://travis-ci.org/zhm/pg-custom-types)

Use custom data types with [node-postgres](https://github.com/brianc/node-postgres).

## Releases

Pull requests, merge queue entries and main changes run CI on GitHub-hosted
runners. After main validation succeeds, a GitHub App commits the next version
to `package.json` and creates its matching SemVer tag. Do not edit the root
package version manually. Tag creation starts the GitHub Packages publishing
workflow; this repository does not publish to npmjs.org.

Before enabling releases, configure fork-run approval, required CI checks,
GitHub Packages access, and the release App's branch and tag protection
bypasses. Disable the old Tekton publisher at cutover. If publishing fails,
rerun the tag workflow against the same tag; it verifies the release commit and
the package version before publishing.

## Installation

```sh
npm install pg-custom-types
```

### Documentation

### `types(pg, connection, name, types, callback)`

Fetches the OIDs for the given types.

### Parameters

| parameter       | type               | description                                                                        |
| --------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `fetcher`       | Object             | The query function of the form `function (sql, callback)`                          |
| `key`           | String             | A name for the given set of types, used to cache the results. It can be anything.  |
| `types`         | Array              | The array of data type names to fetch                                              |
| `callback`      | Function           | The callback to call after the types are fetched                                   |

Callback is called with an object containing a lookup table.

```
{ 21842552: 'geometry',
  21842762: 'geography' }
```

## Example

```js
var types = require('pg-custom-types');

types(types.fetcher(pg, connection), 'postgis', ['geometry', 'geography'], (err, oids) {
  if (err) {
    throw err;
  }

  console.log(oids.geometry);
  console.log(oids.geography);

  pg.setTypeParser(oids.geometry, function (value) {
    // parse geometry type
  });
});
```

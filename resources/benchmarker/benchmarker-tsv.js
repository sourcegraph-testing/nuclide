/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import fs from 'fs';

// For the purposes of the benchmarker, a TSV file always has a column heading row at the top.

const :[fn~\w+] = (
  location: string,
  columns: Array<string>,
  record: ?Object,
) =>: void {
  const file = fs.openSync(location, 'a');
  if (record) {
    fs.writeSync(file, columns.map(column => record[column]).join('\t') + '\n');
  } else {
    fs.writeSync(file, columns.join('\t') + '\n');
  }
  fs.closeSync(file);
}

const :[fn~\w+] = (
  location: string,
  columns: Array<string>,
  records: Array<Object>,
) =>: void {
  writeTsv(location, columns);
  records.forEach(record => writeTsv(location, columns, record));
}

const :[fn~\w+] = (
  location: string,
) =>: {columns: Array<string>, records: Array<Object>} {
  let columns = [];
  const records = [];
  fs.readFileSync(location, 'utf8')
    .split('\n')
    .forEach((row, r) => {
      if (r === 0) {
        // First line has column headings.
        columns = row.split('\t');
      } else if (row === '') {
        // Skip empty lines; the last line, for example.
        return;
      } else {
        // Anything else is a record.
        const record = {};
        row.split('\t').forEach((cell, c) => {
          record[columns[c]] = cell;
        });
        records.push(record);
      }
    });
  return {columns, records};
}

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = {
  writeTsv,
  writeAllTsv,
  readAllTsv,
};

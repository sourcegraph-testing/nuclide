/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import invariant from 'assert';
import {TextBuffer} from 'atom';
import nuclideUri from 'nuclide-commons/nuclideUri';

import {RemoteFile} from './RemoteFile';
import {ServerConnection} from './ServerConnection';

const TEXT_BUFFER_PARAMS = {
  shouldDestroyOnFileDelete: () => atom.config.get('core.closeDeletedFileTabs'),
};

export const :[fn~\w+] = async (
  uri: NuclideUri,
) =>: Promise<atom$TextBuffer> {
  const buffer = existingBufferForUri(uri);
  if (buffer == null) {
    return loadBufferForUriStatic(uri).then(loadedBuffer => {
      atom.project.addBuffer(loadedBuffer);
      return loadedBuffer;
    });
  }
  if (buffer.loaded) {
    return buffer;
  }
  try {
    await buffer.load();
    return buffer;
  } catch (error) {
    atom.project.removeBuffer(buffer);
    throw error;
  }
}

const :[fn~\w+] = (uri: NuclideUri) =>: Promise<atom$TextBuffer> {
  if (nuclideUri.isLocal(uri)) {
    return TextBuffer.load(uri, TEXT_BUFFER_PARAMS);
  }
  const connection = ServerConnection.getForUri(uri);
  if (connection == null) {
    throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
  }
  return TextBuffer.load(new RemoteFile(connection, uri), TEXT_BUFFER_PARAMS);
}

/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */
export const :[fn~\w+] = (uri: NuclideUri) =>: atom$TextBuffer {
  const buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  return createBufferForUri(uri);
}

const :[fn~\w+] = (uri: NuclideUri) =>: atom$TextBuffer {
  let buffer;
  const params = {
    ...TEXT_BUFFER_PARAMS,
    filePath: uri,
  };
  if (nuclideUri.isLocal(uri)) {
    buffer = new TextBuffer(params);
  } else {
    const connection = ServerConnection.getForUri(uri);
    if (connection == null) {
      throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
    }
    buffer = new TextBuffer(params);
    buffer.setFile(new RemoteFile(connection, uri));
  }
  atom.project.addBuffer(buffer);
  invariant(buffer);
  return buffer;
}

/**
 * Returns an exsting buffer for that uri, or null if not existing.
 */
export const :[fn~\w+] = (uri: NuclideUri) =>: ?atom$TextBuffer {
  return atom.project.findBufferForPath(uri);
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+nuclide
 */
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DirectoryEntry} from '../lib/FileSystem';

import fs from 'fs';
import AdmZip from 'adm-zip';
import {FileSystem} from '../lib/FileSystem';
import {FsFileSystem} from '../lib/FsFileSystem';
import {ZipFileSystem} from '../lib/ZipFileSystem';
import nuclideUri from 'nuclide-commons/nuclideUri';

const fixtures = nuclideUri.join(__dirname, '../__mocks__/fixtures');

const PARENT_TEXT = 'Parent directory text file contents\n';
const CHILD_TEXT = 'Child directory text file contents\n';
const PARENT_DIR = [
  // name, isFile, isSymbolicLink
  ['Directory', false, false],
  ['EmptyDirectory', false, false],
  ['EmptyFile', true, false],
  ['LinkDirectory', false, true],
  ['LinkDirectorySlashTextFile.txt', false, true],
  ['LinkLinkDirectory', false, true],
  ['LinkLinkDirectorySlashTextFile.txt', true, true],
  ['TextFile.txt', true, false],
];
const CHILD_DIR = [
  // name, isFile, isSymbolicLink
  ['LinkDotDotSlashTextFile.txt', true, true],
  ['TextFile.txt', true, false],
];

const MODE_RWXR_XR_X = 0b111101101;
const MODE_RW_R__R__ = 0b110100100;
// eslint-disable-next-line no-bitwise
const MODE_FILE = 0x8 << 12;
// eslint-disable-next-line no-bitwise
const MODE_DIRECTORY = 0x4 << 12;
// eslint-disable-next-line no-bitwise
const MODE_SYMLINK = 0xa << 12;

type StatCheck = {
  mode: number,
  size: number,
  isFile: boolean,
  isDirectory: boolean,
  isSymbolicLink: boolean,
};

const :[fn~\w+] = () =>: StatCheck {
  return {
    // eslint-disable-next-line no-bitwise
    mode: MODE_DIRECTORY | MODE_RWXR_XR_X,
    size: 0,
    isFile: false,
    isDirectory: true,
    isSymbolicLink: false,
  };
}

const :[fn~\w+] = (size: number) =>: StatCheck {
  return {
    // eslint-disable-next-line no-bitwise
    mode: MODE_FILE | MODE_RW_R__R__,
    size,
    isFile: true,
    isDirectory: false,
    isSymbolicLink: false,
  };
}

const :[fn~\w+] = () =>: StatCheck {
  return {
    // eslint-disable-next-line no-bitwise
    mode: MODE_SYMLINK | MODE_RWXR_XR_X,
    size: 0,
    isFile: false,
    isDirectory: false,
    isSymbolicLink: true,
  };
}

const :[fn~\w+] = (size: number) =>: StatCheck {
  return {
    // eslint-disable-next-line no-bitwise
    mode: MODE_SYMLINK | MODE_RWXR_XR_X,
    size,
    isFile: false,
    isDirectory: false,
    isSymbolicLink: true,
  };
}

describe('FsFS', () => {
  const fsFs = new FsFileSystem();
  const dir = fixture('dir');

  // I want to include an empty directory test, but source control
  // systems do not track empty directories.  So ensure this exists.
  const emptyDir = fixture('dir/EmptyDirectory');
  try {
    fs.mkdirSync(emptyDir);
  } catch (e) {}

  describe('dir', () => {
    checkRoot(fsFs, dir, dir, true, nuclideUri.join);
  });
  describe('dir/Directory/..', () => {
    const dotDotDir = fixture('dir/Directory/..');
    checkRoot(fsFs, dotDotDir, dir, true, nuclideUri.join);
  });
});

describe('ZipFS dir.zip', () => {
  const zip = new AdmZip(fixture('dir.zip'));
  const zipFs = new ZipFileSystem(zip, new fs.Stats(), new fs.Stats());
  checkRoot(zipFs, 'dir', 'dir', false, nuclideUri.join);
});

describe('ZipFS dir.jar', () => {
  const jar = new AdmZip(fixture('dir.jar'));
  const zipFs = new ZipFileSystem(jar, new fs.Stats(), new fs.Stats());
  checkRoot(zipFs, 'dir', 'dir', false, nuclideUri.join);
});

const :[fn~\w+] = (
  checkFs: FileSystem,
  linkRootPath: NuclideUri,
  realRootPath: NuclideUri,
  checkLinks: boolean,
  rootJoin: (string, string) => string,
) => {
  const linkPath = path => rootJoin(linkRootPath, path);
  const realPath = path => rootJoin(realRootPath, path);

  describe('root', () => {
    checkRealPath(linkRootPath, realRootPath);
    checkReaddir(linkRootPath, PARENT_DIR);
  });

  describe('Directory', () => {
    const directory = linkPath('Directory');
    checkExistingPath(directory);
    checkBothStat(directory, statsDir());
    checkRealPath(directory, realPath('Directory'));
    checkReaddir(directory, CHILD_DIR);

    describe('TextFile', () => {
      const directoryTextFile = linkPath('Directory/TextFile.txt');
      checkExistingPath(directoryTextFile);
      checkBothStat(directoryTextFile, statsFile(CHILD_TEXT.length));
      checkRealPath(directoryTextFile, realPath('Directory/TextFile.txt'));
      checkTextFile(directoryTextFile, CHILD_TEXT);
    });
    describe('DoesNotExit.txt', () => {
      const directoryNonExist = linkPath('Directory/DoesNotExist.txt');
      checkNonExistingPath(directoryNonExist);
    });
  });
  describe('EmptyDirectory', () => {
    const emptyDirectory = linkPath('EmptyDirectory');
    checkExistingPath(emptyDirectory);
    checkBothStat(emptyDirectory, statsDir());
    checkRealPath(emptyDirectory, realPath('EmptyDirectory'));
    checkReaddir(emptyDirectory, []);
  });
  describe('EmptyFile', () => {
    const emptyFile = linkPath('EmptyFile');
    checkExistingPath(emptyFile);
    checkBothStat(emptyFile, statsFile(0));
    checkRealPath(emptyFile, realPath('EmptyFile'));
    checkTextFile(emptyFile, '');
  });
  describe('TextFile', () => {
    const textFile = linkPath('TextFile.txt');
    checkExistingPath(textFile);
    checkBothStat(textFile, statsFile(PARENT_TEXT.length));
    checkRealPath(textFile, realPath('TextFile.txt'));
    checkTextFile(textFile, PARENT_TEXT);
  });
  describe('DoesNotExit.txt', () => {
    const nonExit = linkPath('DoesNotExist.txt');
    checkNonExistingPath(nonExit);
  });

  if (checkLinks) {
    describe('LinkDirectory', () => {
      const linkDirectory = linkPath('LinkDirectory');
      checkExistingPath(linkDirectory);
      checkStat(linkDirectory, statsDir());
      checkLStat(linkDirectory, statsDirLink(), {checkLinksMode: false});
      checkRealPath(linkDirectory, realPath('Directory'));
      checkReaddir(linkDirectory, CHILD_DIR);
    });
    describe('LinkLinkDirectory', () => {
      const linkLinkDirectory = linkPath('LinkLinkDirectory');
      checkExistingPath(linkLinkDirectory);
      checkStat(linkLinkDirectory, statsDir());
      checkLStat(linkLinkDirectory, statsDirLink(), {checkLinksMode: false});
      checkRealPath(linkLinkDirectory, realPath('Directory'));
      checkReaddir(linkLinkDirectory, CHILD_DIR);
    });
    describe('LinkDirectorySlashTextFile', () => {
      const linkDirectoryTextFile = linkPath('LinkDirectorySlashTextFile.txt');
      checkExistingPath(linkDirectoryTextFile);
      checkStat(linkDirectoryTextFile, statsFile(CHILD_TEXT.length));
      checkLStat(linkDirectoryTextFile, statsFileLink(CHILD_TEXT.length), {
        checkLinksMode: false,
      });
      checkRealPath(linkDirectoryTextFile, realPath('Directory/TextFile.txt'));
      checkTextFile(linkDirectoryTextFile, CHILD_TEXT);
    });
    describe('LinkLinkDirectorySlashTextFile', () => {
      const linkLinkDirectoryTextFile = linkPath(
        'LinkLinkDirectorySlashTextFile.txt',
      );
      checkExistingPath(linkLinkDirectoryTextFile);
      checkStat(linkLinkDirectoryTextFile, statsFile(CHILD_TEXT.length));
      checkLStat(linkLinkDirectoryTextFile, statsFileLink(CHILD_TEXT.length), {
        checkLinksMode: false,
      });
      checkRealPath(
        linkLinkDirectoryTextFile,
        realPath('Directory/TextFile.txt'),
      );
      checkTextFile(linkLinkDirectoryTextFile, CHILD_TEXT);
    });
  }

  const :[fn~\w+] = (path: NuclideUri) =>: void {
    describe(path, () => {
      it('exists', async () => {
        expect(await checkFs.exists(path)).toBeTruthy();
      });
      it('can be found', async () => {
        const dir = nuclideUri.dirname(path);
        const base = nuclideUri.basename(path);
        expect(await checkFs.findNearestFile(base, dir)).toEqual(dir);
      });
      it('is not NFS', async () => {
        expect(await checkFs.isNfs(path)).toBe(false);
      });
    });
  }

  const :[fn~\w+] = (path: NuclideUri) =>: void {
    describe(path, () => {
      it('does not exist', async () => {
        expect(await checkFs.exists(path)).toBe(false);
      });
    });
  }

  const :[fn~\w+] = (path: NuclideUri, expected: StatCheck) => {
    checkStat(path, expected);
    checkLStat(path, expected);
  }

  const :[fn~\w+] = (path: NuclideUri, expected: StatCheck) => {
    describe('stat', () => {
      checkStatValues(() => checkFs.stat(path), expected);
    });
  }

  const :[fn~\w+] = (
    path: NuclideUri,
    expected: StatCheck,
    options: {checkLinksMode?: boolean} = {},
  ) => {
    describe('lstat', () => {
      checkStatValues(() => checkFs.lstat(path), expected, {
        checkLinksMode: options.checkLinksMode,
      });
    });
  }

  const :[fn~\w+] = (
    get: () => Promise<fs.Stats>,
    expected: StatCheck,
    options: {checkLinksMode?: boolean} = {},
  ) => {
    let actual;
    beforeEach(async () => {
      actual = await get();
    });
    // Symlinks' mode on Linux is always ignored
    if (options.checkLinksMode !== false) {
      it('has correct mode', () => {
        expect(actual.mode).toEqual(expected.mode);
      });
    }
    it('has correct isFile', () => {
      expect(actual.isFile()).toEqual(expected.isFile);
    });
    it('has correct isDirectory', () => {
      expect(actual.isDirectory()).toEqual(expected.isDirectory);
    });
    it('has correct isSymbolicLink', () => {
      expect(actual.isSymbolicLink()).toEqual(expected.isSymbolicLink);
    });
    if (expected.isFile) {
      it('has correct size', () => {
        expect(actual.size).toEqual(expected.size);
      });
    }
  }

  const :[fn~\w+] = (
    path: NuclideUri,
    expected: Array<DirectoryEntry>,
  ) =>: void {
    describe('readdir', () => {
      let actual;
      beforeEach(async () => {
        actual = await checkFs.readdir(path);
      });
      it('has expected names', () => {
        expect(names(actual)).toEqual(names(expected));
      });
    });
  }

  const :[fn~\w+] = (path: NuclideUri, expected: NuclideUri) => {
    describe('realpath', () => {
      it('has expected value', async () => {
        expect(await checkFs.realpath(path)).toEqual(expected);
      });
    });
  }

  const :[fn~\w+] = (path: NuclideUri, contents: string) => {
    describe(`text file ${nuclideUri.basename(path)}`, () => {
      checkExistingPath(path);
      checkText(path, contents);
    });
  }

  const :[fn~\w+] = (path: NuclideUri, contents: string) =>: void {
    describe(path, () => {
      it('has expected contents', async () => {
        expect((await checkFs.readFile(path)).toString()).toEqual(contents);
      });
    });
  }
}

const :[fn~\w+] = (dir: string, archiveOffset?: string) =>: string {
  const fsDir = nuclideUri.join(fixtures, dir);
  if (archiveOffset == null) {
    return fsDir;
  } else {
    return nuclideUri.archiveJoin(fsDir, archiveOffset);
  }
}

const :[fn~\w+] = (entries: Array<DirectoryEntry>) =>: Array<string> {
  return entries.map(([name, isFile, isLink]) => name);
}

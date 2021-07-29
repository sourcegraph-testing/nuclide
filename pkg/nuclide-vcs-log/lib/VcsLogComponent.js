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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {VcsLogEntry} from '../../nuclide-hg-rpc/lib/types';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client/lib/HgRepositoryClient.js';

import {EmptyState} from 'nuclide-commons-ui/EmptyState';
import * as React from 'react';
import {getAtomProjectRelativePath} from 'nuclide-commons-atom/projects';
import {shell} from 'electron';
import {shortNameForAuthor} from './util';
import {ShowDiff} from './ShowDiff';
import {
  FlexDirections,
  ResizableFlexContainer,
  ResizableFlexItem,
} from '../../nuclide-ui/ResizableFlexContainer';

type Props = {
  files: Array<NuclideUri>,
  showDifferentialRevision: boolean,
  repository: HgRepositoryClient,
  onDiffClick: (oldId: string, newId: string) => void,
  logEntries: ?Array<VcsLogEntry>,
  fileLoadingError: ?string,
  oldContent: ?string,
  newContent: ?string,
};

type State = {
  showDiffContainer: boolean,
  baseDiffIndex: ?number,
  targetDiffIndex: ?number,
};

export default class VcsLogComponent extends React.Component<Props, State> {
  _files: Array<string>;

  constructor(props: Props) {
    super(props);
    this._files = [];
    for (const file of props.files) {
      const projectPath = getAtomProjectRelativePath(file);
      if (projectPath != null) {
        this._files.push(projectPath);
      }
    }

    this.state = {
      showDiffContainer: false,
      baseDiffIndex: null,
      targetDiffIndex: null,
    };
  }

  render(): React.Node {
    const {logEntries, fileLoadingError} = this.props;
    if (logEntries != null) {
      // Even if the "Show Differential Revision" preference is enabled, only show the column if
      // there is at least one row with a Differential revision. This way, enabling the preference
      // by default should still work fine for non-Differential users.

      let showDifferentialRevision;
      const differentialUrls = [];
      if (this.props.showDifferentialRevision) {
        logEntries.forEach((logEntry: VcsLogEntry, index: number) => {
          const url = parseDifferentialRevision(logEntry);
          if (url != null) {
            differentialUrls[index] = url;
          }
        });
        showDifferentialRevision = differentialUrls.length > 0;
      } else {
        showDifferentialRevision = false;
      }

      const rows = logEntries.map((logEntry: VcsLogEntry, index: number) => {
        return this._renderRow(logEntries, index, differentialUrls);
      });

      // Note that we use the native-key-bindings/tabIndex=-1 trick to make it possible to
      // copy/paste text from the pane. This has to be applied on a child element of
      // nuclide-vcs-log-scroll-container, or else the native-key-bindings/tabIndex=-1 will
      // interfere with scrolling.
      const logTable = (
        <div className="nuclide-vcs-log-scroll-container">
          <div className="native-key-bindings" tabIndex="-1">
            <table>
              <tbody>
                <tr>
                  <th className="nuclide-vcs-log-header-cell">Date</th>
                  <th className="nuclide-vcs-log-header-cell">Hash</th>
                  {showDifferentialRevision ? (
                    <th className="nuclide-vcs-log-header-cell">Diff</th>
                  ) : null}
                  <th className="nuclide-vcs-log-header-cell">Author</th>
                  <th className="nuclide-vcs-log-header-cell">Summary</th>
                  <th className="nuclide-vcs-log-header-cell">Show diff</th>
                </tr>
                {rows}
              </tbody>
            </table>
          </div>
        </div>
      );

      if (!this.state.showDiffContainer) {
        return logTable;
      } else {
        const filePath = this.props.files[0];
        const {oldContent, newContent} = this.props;
        const props = {filePath, oldContent, newContent};
        const diffSection =
          fileLoadingError != null ? (
            <EmptyState
              title={'Error loading diffs'}
              message={fileLoadingError}
            />
          ) : (
            <ShowDiff {...props} />
          );
        return (
          // $FlowFixMe(>=0.53.0) Flow suppress
          <ResizableFlexContainer
            direction={FlexDirections.VERTICAL}
            className={'nuclide-vcs-log-container'}>
            <ResizableFlexItem initialFlexScale={3}>
              {diffSection}
            </ResizableFlexItem>
            <ResizableFlexItem
              initialFlexScale={1}
              className={'nuclide-vcs-log-entries-container'}>
              {logTable}
            </ResizableFlexItem>
          </ResizableFlexContainer>
        );
      }
    } else {
      return (
        <EmptyState
          title={'Loading hg log ' + this._files.join(' ')}
          message={
            <div className="nuclide-vcs-log-spinner">
              <div className="loading-spinner-large inline-block" />
            </div>
          }
        />
      );
    }
  }

  _renderRow(
    logEntries: Array<VcsLogEntry>,
    index: number,
    differentialUrls: Array<string>,
  ): React.Element<any> {
    const showDifferentialRevision =
      this.props.showDifferentialRevision && differentialUrls.length > 0;
    let differentialCell;
    if (showDifferentialRevision) {
      const url = differentialUrls[index];
      let revision;
      let onClick;
      if (url != null) {
        revision = url.substring(url.lastIndexOf('/') + 1);
        onClick = () => shell.openExternal(url);
      } else {
        revision = null;
        onClick = null;
      }
      differentialCell = (
        <td className="nuclide-vcs-log-differential-cell">
          <span
            className="nuclide-vcs-log-differential-cell-text"
            onClick={onClick}>
            {revision}
          </span>
        </td>
      );
    } else {
      differentialCell = null;
    }

    const nodeAtIndex = (nodeIndex: number) =>
      logEntries[nodeIndex] ? logEntries[nodeIndex].node : '';
    const {baseDiffIndex, targetDiffIndex} = this.state;
    let showDiffCell = null;
    if (this.props.files.length === 1) {
      showDiffCell = (
        <span className="input-radio-container">
          {index !== 0 ? (
            <input
              className="input-radio"
              type="radio"
              checked={index === baseDiffIndex}
              disabled={targetDiffIndex != null && index <= targetDiffIndex}
              onChange={() => {
                const newTargetDiffIndex =
                  targetDiffIndex != null ? targetDiffIndex : index - 1;
                this.setState({
                  showDiffContainer: true,
                  baseDiffIndex: index,
                  targetDiffIndex: newTargetDiffIndex,
                });
                this.props.onDiffClick(
                  nodeAtIndex(index),
                  nodeAtIndex(newTargetDiffIndex),
                );
              }}
            />
          ) : null}
          {index !== logEntries.length - 1 || index === 0 ? (
            <input
              className="input-radio right-align"
              type="radio"
              checked={index === targetDiffIndex}
              disabled={baseDiffIndex != null && index >= baseDiffIndex}
              onChange={() => {
                const newBaseDiffIndex =
                  baseDiffIndex != null ? baseDiffIndex : index + 1;
                this.setState({
                  showDiffContainer: true,
                  baseDiffIndex: newBaseDiffIndex,
                  targetDiffIndex: index,
                });
                this.props.onDiffClick(
                  nodeAtIndex(newBaseDiffIndex),
                  nodeAtIndex(index),
                );
              }}
            />
          ) : null}
        </span>
      );
    }

    const logEntry = logEntries[index];
    return (
      <tr key={logEntry.node}>
        <td className="nuclide-vcs-log-date-cell">
          {this._toDateString(logEntry.date[0])}
        </td>
        <td className="nuclide-vcs-log-id-cell">
          {logEntry.node.substring(0, 8)}
        </td>
        {differentialCell}
        <td className="nuclide-vcs-log-author-cell">
          {shortNameForAuthor(logEntry.author)}
        </td>
        <td className="nuclide-vcs-log-summary-cell" title={logEntry.desc}>
          {parseFirstLine(logEntry.desc)}
        </td>
        <td className="nuclide-vcs-log-show-diff-cell">{showDiffCell}</td>
      </tr>
    );
  }

  _toDateString(secondsSince1970: number): string {
    const date = new Date(secondsSince1970 * 1000);

    // We may want to make date formatting customizable via props.
    // The format of str is "Fri Apr 22 2016 21:32:51 GMT+0100 (BST)".
    // Note that this is date will be displayed in the local time zone of the viewer rather
    // than that of the author of the commit.
    const str = date.toString();

    // Strip the day of week from the start of the string and the seconds+TZ from the end.
    const startIndex = str.indexOf(' ') + 1;
    const endIndex = str.lastIndexOf(':');
    return str.substring(startIndex, endIndex);
  }
}

const :[fn~\w+] = (desc: string) =>: string {
  const index = desc.indexOf('\n');
  if (index === -1) {
    return desc;
  } else {
    return desc.substring(0, index);
  }
}

const DIFFERENTIAL_REVISION_RE = /^Differential Revision:\s*(.*)$/im;

const :[fn~\w+] = (logEntry: VcsLogEntry) =>: ?string {
  const {desc} = logEntry;
  const match = desc.match(DIFFERENTIAL_REVISION_RE);
  if (match != null) {
    return match[1];
  } else {
    return null;
  }
}

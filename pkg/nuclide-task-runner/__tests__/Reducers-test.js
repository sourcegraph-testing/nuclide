/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+nuclide
 */
import type {ConsoleApi} from 'atom-ide-ui';

import * as Actions from '../lib/redux/Actions';
import {consolesForTaskRunners} from '../lib/redux/Reducers';
import * as dummy from '../__mocks__/dummy';
import * as Immutable from 'immutable';

describe('Reducers', () => {
  describe('consolesForTaskRunners', () => {
    describe('SET_CONSOLES_FOR_TASK_RUNNERS', () => {
      it('disposes all previously created consoles', () => {
        const oldConsole = createMockConsole();
        const newConsole1 = createMockConsole();
        const newConsole2 = createMockConsole();
        const oldState = Immutable.Map([[new dummy.TaskRunner(), oldConsole]]);
        const newState = consolesForTaskRunners(
          oldState,
          Actions.setConsolesForTaskRunners(
            Immutable.Map([
              [new dummy.TaskRunner(), newConsole1],
              [new dummy.TaskRunner(), newConsole2],
            ]),
          ),
        );
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(2);
        expect(consoleIsDisposed(oldConsole)).toEqual(true);
      });
    });
    describe('SET_CONSOLE_SERVICE', () => {
      it('simply clears the created consoles', () => {
        const mockConsole = createMockConsole();
        const oldState = Immutable.Map([[new dummy.TaskRunner(), mockConsole]]);
        const newState = consolesForTaskRunners(
          oldState,
          Actions.setConsoleService(null),
        );
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(0);
        expect(consoleIsDisposed(mockConsole)).toEqual(true);
      });
    });
    describe('ADD_CONSOLE_FOR_TASK_RUNNER', () => {
      it("adds a new console, but doesn't touch the previous ones", () => {
        const oldConsole = createMockConsole();
        const newConsole = createMockConsole();
        const oldState = Immutable.Map([[new dummy.TaskRunner(), oldConsole]]);
        const newState = consolesForTaskRunners(
          oldState,
          Actions.addConsoleForTaskRunner(new dummy.TaskRunner(), newConsole),
        );
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(2);
        expect(consoleIsDisposed(oldConsole)).toEqual(false);
      });
    });
    describe('REMOVE_CONSOLE_FOR_TASK_RUNNER', () => {
      it('removes and disposes the console', () => {
        const mockConsole = createMockConsole();
        const taskRunner = new dummy.TaskRunner();
        const oldState = Immutable.Map([[taskRunner, mockConsole]]);
        const newState = consolesForTaskRunners(
          oldState,
          Actions.removeConsoleForTaskRunner(taskRunner),
        );
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(0);
        expect(consoleIsDisposed(mockConsole)).toEqual(true);
      });
    });
  });
});

const :[fn~\w+] = () =>: ConsoleApi {
  let disposed = false;
  return (({
    isDisposed: () => disposed,
    dispose: () => {
      disposed = true;
    },
  }: any): ConsoleApi);
}

const :[fn~\w+] = (consoleApi: ConsoleApi) =>: boolean {
  return (consoleApi: any).isDisposed();
}

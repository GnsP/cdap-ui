/*
 * Copyright © 2023 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { combineReducers, createStore, Store as StoreInterface } from 'redux';
import { composeEnhancers } from 'services/helpers';
import { IAction } from 'services/redux-helpers';
import { IOperationRun, IRepositoryPipeline, SortBy, SortOrder, SyncStatusFilter } from '../types';

export const DEFAULT_PAGE_SIZE = 10;

interface IPushViewState {
  ready: boolean;
  localPipelines: IRepositoryPipeline[];
  nameFilter: string;
  syncStatusFilter?: SyncStatusFilter;
  pageSize: number;
  nextPageTokens: string[];
  currentPage: number;
  sortOrder: SortOrder;
  sortBy: SortBy;
  selectedPipelines: string[];
  commitModalOpen: boolean;
  loadingMessage: string;
  showFailedOnly: boolean;
  lastRefreshTime?: number;
}

interface IPullViewState {
  ready: boolean;
  remotePipelines: IRepositoryPipeline[];
  nameFilter: string;
  syncStatusFilter?: SyncStatusFilter;
  pageSize: number;
  nextPageTokens: string[];
  currentPage: number;
  sortOrder: SortOrder;
  sortBy: SortBy;
  selectedPipelines: string[];
  loadingMessage: string;
  showFailedOnly: boolean;
  pullViewErrorMsg: string;
  lastRefreshTime?: number;
}

interface IOperationRunState {
  running: boolean;
  operation?: IOperationRun;
  showLastOperationInfo: boolean;
}

interface IStore {
  push: IPushViewState;
  pull: IPullViewState;
  operationRun: IOperationRunState;
}

export const PushToGitActions = {
  setLocalPipelines: 'LOCAL_PIPELINES_SET',
  reset: 'LOCAL_PIPELINES_RESET',
  setNameFilter: 'LOCAL_PIPELINES_SET_NAME_FILTER',
  applySearch: 'LOCAL_PIPELINES_APPLY_SERACH',
  setSelectedPipelines: 'LOCAL_PIPELINES_SET_SELECTED_PIPELINES',
  toggleCommitModal: 'LOCAL_PIPELINES_TOGGLE_COMMIT_MODAL',
  setLoadingMessage: 'LOCAL_PIPELINES_SET_LOADING_MESSAGE',
  toggleShowFailedOnly: 'LOCAL_PIPELINES_TOGGLE_SHOW_FAILED_ONLY',
  setSyncStatusFilter: 'LOCAL_PIPELINES_SET_SYNC_STATUS_FILTER',
  setPageSize: 'LOCAL_PIPELINES_SET_PAGE_SIZE',
  setPageToken: 'LOCAL_PIPELINES_SET_PAGE_TOKEN',
  setCurrentPage: 'LOCAL_PIPELINES_SET_CURRENT_PAGE',
  setSortConfig: 'LOCAL_PIPELINES_SET_SORT_CONFIG',
  markStale: 'LOCAL_PIPELINES_MARK_STALE',
  setLastRefreshTime: 'LOCAL_PIPELINES_SET_LAST_REFRESH_TIME',
};

export const PullFromGitActions = {
  setRemotePipelines: 'REMOTE_PIPELINES_SET',
  reset: 'REMOTE_PIPELINES_RESET',
  setNameFilter: 'REMOTE_PIPELINES_SET_NAME_FILTER',
  applySearch: 'REMOTE_PIPELINES_APPLY_SERACH',
  setSelectedPipelines: 'REMOTE_PIPELINES_SET_SELECTED_PIPELINES',
  setLoadingMessage: 'REMOTE_PIPELINES_SET_LOADING_MESSAGE',
  toggleShowFailedOnly: 'REMOTE_PIPELINES_TOGGLE_SHOW_FAILED_ONLY',
  setPullViewErrorMsg: 'REMOTE_PIPELINES_SET_ERROR_MSG',
  setSyncStatusFilter: 'REMOTE_PIPELINES_SET_SYNC_STATUS_FILTER',
  setPageSize: 'REMOTE_PIPELINES_SET_PAGE_SIZE',
  setPageToken: 'REMOTE_PIPELINES_SET_PAGE_TOKEN',
  setCurrentPage: 'REMOTE_PIPELINES_SET_CURRENT_PAGE',
  setSortConfig: 'REMOTE_PIPELINES_SET_SORT_CONFIG',
  markStale: 'REMOTE_PIPELINES_MARK_STALE',
  setLastRefreshTime: 'REMOTE_PIPELINES_SET_LAST_REFRESH_TIME',
};

export const OperationRunActions = {
  setLatestOperation: 'SET_RUNNING_OPERATION',
  unsetLatestOperation: 'UNSET_RUNNING_OPERATION',
  setShowLastOperationInfo: 'SET_SHOW_LAST_OPERATION_INFO',
};

const defaultPushViewState: IPushViewState = {
  ready: false,
  localPipelines: [],
  nameFilter: '',
  pageSize: DEFAULT_PAGE_SIZE,
  nextPageTokens: [],
  currentPage: 0,
  sortOrder: 'ASC',
  sortBy: 'NAME',
  selectedPipelines: [],
  commitModalOpen: false,
  loadingMessage: null,
  showFailedOnly: false,
};

const defaultPullViewState: IPullViewState = {
  ready: false,
  remotePipelines: [],
  nameFilter: '',
  pageSize: DEFAULT_PAGE_SIZE,
  nextPageTokens: [],
  currentPage: 0,
  sortOrder: 'ASC',
  sortBy: 'NAME',
  selectedPipelines: [],
  loadingMessage: null,
  showFailedOnly: false,
  pullViewErrorMsg: '',
};

const defaultOperationRunState: IOperationRunState = {
  running: false,
  showLastOperationInfo: true,
};

function updateNextPageToken(
  nextPageTokens: string[],
  currentPage: number,
  nextToken?: string
): string[] {
  const tokensDraft = [...nextPageTokens];
  tokensDraft[currentPage] = nextToken;
  return tokensDraft;
}

const push = (state = defaultPushViewState, action: IAction) => {
  switch (action.type) {
    case PushToGitActions.setLocalPipelines:
      return {
        ...state,
        localPipelines: action.payload.localPipelines,
        ready: true,
      };
    case PushToGitActions.setNameFilter:
      return {
        ...state,
        nameFilter: action.payload.nameFilter,
      };
    case PushToGitActions.applySearch:
      return {
        ...defaultPushViewState,
        nameFilter: state.nameFilter,
        syncStatusFilter: state.syncStatusFilter,
        selectedPipelines: state.selectedPipelines,
      };
    case PushToGitActions.setSelectedPipelines:
      return {
        ...state,
        selectedPipelines: action.payload.selectedPipelines,
      };
    case PushToGitActions.toggleCommitModal:
      return {
        ...state,
        commitModalOpen: !state.commitModalOpen,
      };
    case PushToGitActions.setLoadingMessage:
      return {
        ...state,
        loadingMessage: action.payload.loadingMessage,
      };
    case PushToGitActions.toggleShowFailedOnly:
      return {
        ...state,
        showFailedOnly: !state.showFailedOnly,
      };
    case PushToGitActions.setSyncStatusFilter:
      return {
        ...state,
        syncStatusFilter: action.payload,
      };
    case PushToGitActions.setPageSize:
      return {
        ...state,
        pageSize: action.payload,
      };
    case PushToGitActions.setCurrentPage:
      return {
        ...state,
        currentPage: action.payload,
      };
    case PushToGitActions.setPageToken:
      return {
        ...state,
        nextPageTokens: updateNextPageToken(
          state.nextPageTokens,
          action.payload.currentPage,
          action.payload.nextToken
        ),
        currentPage: action.payload.currentPage,
      };
    case PushToGitActions.setSortConfig:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };
    case PushToGitActions.reset:
      return defaultPushViewState;
    case PushToGitActions.markStale:
      return {
        ...state,
        ready: false,
      };
    case PushToGitActions.setLastRefreshTime:
      return {
        ...state,
        lastRefreshTime: action.payload,
      };
    default:
      return state;
  }
};

const pull = (state = defaultPullViewState, action: IAction) => {
  switch (action.type) {
    case PullFromGitActions.setRemotePipelines:
      return {
        ...state,
        remotePipelines: action.payload.remotePipelines,
        ready: true,
      };
    case PullFromGitActions.setNameFilter:
      return {
        ...state,
        nameFilter: action.payload.nameFilter,
      };
    case PullFromGitActions.setPullViewErrorMsg:
      return {
        ...state,
        pullViewErrorMsg: action.payload.pullViewErrorMsg,
      };
    case PullFromGitActions.applySearch:
      return {
        ...defaultPushViewState,
        nameFilter: state.nameFilter,
        syncStatusFilter: state.syncStatusFilter,
        selectedPipelines: state.selectedPipelines,
      };
    case PullFromGitActions.setSelectedPipelines:
      return {
        ...state,
        selectedPipelines: action.payload.selectedPipelines,
      };
    case PullFromGitActions.setLoadingMessage:
      return {
        ...state,
        loadingMessage: action.payload.loadingMessage,
      };
    case PullFromGitActions.toggleShowFailedOnly:
      return {
        ...state,
        showFailedOnly: !state.showFailedOnly,
      };
    case PullFromGitActions.setSyncStatusFilter:
      return {
        ...state,
        syncStatusFilter: action.payload,
      };
    case PullFromGitActions.setPageSize:
      return {
        ...state,
        pageSize: action.payload,
      };
    case PullFromGitActions.setCurrentPage:
      return {
        ...state,
        currentPage: action.payload,
      };
    case PullFromGitActions.setPageToken:
      return {
        ...state,
        nextPageTokens: updateNextPageToken(
          state.nextPageTokens,
          action.payload.currentPage,
          action.payload.nextToken
        ),
        currentPage: action.payload.currentPage,
      };
    case PullFromGitActions.setSortConfig:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };
    case PullFromGitActions.reset:
      return defaultPullViewState;
    case PullFromGitActions.markStale:
      return {
        ...state,
        ready: false,
      };
    case PullFromGitActions.setLastRefreshTime:
      return {
        ...state,
        lastRefreshTime: action.payload,
      };
    default:
      return state;
  }
};

const operationRun = (
  state: IOperationRunState = defaultOperationRunState,
  action: IAction
): IOperationRunState => {
  switch (action.type) {
    case OperationRunActions.setLatestOperation:
      return {
        ...state,
        running: !action.payload?.done,
        operation: action.payload,
        showLastOperationInfo: true,
      };
    case OperationRunActions.unsetLatestOperation:
      return {
        ...state,
        running: false,
        showLastOperationInfo: false,
      };
    case OperationRunActions.setShowLastOperationInfo:
      return {
        ...state,
        showLastOperationInfo: action.payload,
      };
    default:
      return state;
  }
};

const SourceControlManagementSyncStore: StoreInterface<IStore> = createStore(
  combineReducers({
    push,
    pull,
    operationRun,
  }),
  {
    push: defaultPushViewState,
    pull: defaultPullViewState,
    operationRun: defaultOperationRunState,
  },
  composeEnhancers('SourceControlManagementSyncStore')()
);

export default SourceControlManagementSyncStore;

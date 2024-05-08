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

import React from 'react';
import { useSelector } from 'react-redux';
import T from 'i18n-react';

import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { green, red } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import StatusButton from 'components/StatusButton';
import { SUPPORT } from 'components/StatusButton/constants';
import { TYPES as FORMAT_TYPES, format } from 'services/DataFormatter';
import { invertSortOrder } from '../helpers';
import {
  isLastRemotePipelinesPage,
  setSelectedRemotePipelines,
  updatePullCurrentPage,
  updatePullPageSize,
  updatePullSortConfig,
} from '../store/ActionCreator';
import {
  RefreshTimeLabel,
  StyledTableCell,
  StyledTableRow,
  SyncStatusWrapper,
  TableBox,
} from '../styles';
import { IRepositoryPipeline } from '../types';
import { useFeatureFlagDefaultFalse } from 'services/react/customHooks/useFeatureFlag';

const PREFIX = 'features.SourceControlManagement.table';

interface IRepositoryPipelineTableProps {
  remotePipelines: IRepositoryPipeline[];
  selectedPipelines: string[];
  showFailedOnly: boolean;
  enableMultipleSelection?: boolean;
  disabled?: boolean;
  lastOperationInfoShown?: boolean;
}

export const RemotePipelineTable = ({
  remotePipelines,
  selectedPipelines,
  showFailedOnly,
  enableMultipleSelection = false,
  disabled = false,
  lastOperationInfoShown = true,
}: IRepositoryPipelineTableProps) => {
  const isBackendRefreshEnabled = useFeatureFlagDefaultFalse(
    'source.control.metadata.auto.refresh.enabled'
  );
  const isSelected = (name: string) => selectedPipelines.indexOf(name) !== -1;
  const { pageSize, sortBy, sortOrder, currentPage, lastRefreshTime } = useSelector(
    ({ pull }) => pull
  );

  const handleClick = (event: React.MouseEvent, name: string) => {
    if (disabled) {
      return;
    }

    if (enableMultipleSelection) {
      handleMultipleSelection(name);
      return;
    }
    handleSingleSelection(name);
  };

  const handleSingleSelection = (name: string) => {
    const selectedIndex = selectedPipelines.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = [name];
    }
    setSelectedRemotePipelines(newSelected);
  };

  const handleMultipleSelection = (name: string) => {
    const selectedIndex = selectedPipelines.indexOf(name);
    const newSelected = [...selectedPipelines];

    if (selectedIndex === -1) {
      // not currently selected
      newSelected.push(name);
    } else {
      newSelected.splice(selectedIndex, 1);
    }
    setSelectedRemotePipelines(newSelected);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.target.checked) {
      const allSelected = remotePipelines.map((pipeline) => pipeline.name);
      setSelectedRemotePipelines(allSelected);
      return;
    }
    setSelectedRemotePipelines([]);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    updatePullPageSize(parseInt(value, 10));
  };

  const handlePageChange = (event: React.MouseEvent | null, page: number) => {
    updatePullCurrentPage(page);
  };

  const handleSortByName = (event: React.MouseEvent) => {
    const newSortOrder = sortBy === 'NAME' ? invertSortOrder(sortOrder) : 'ASC';
    updatePullSortConfig('NAME', newSortOrder);
  };

  const handleSortBySyncDate = (event: React.MouseEvent) => {
    const newSortOrder = sortBy === 'LAST_SYNCED_AT' ? invertSortOrder(sortOrder) : 'ASC';
    updatePullSortConfig('LAST_SYNCED_AT', newSortOrder);
  };

  return (
    <TableBox lastOperationInfoShown={lastOperationInfoShown}>
      {isBackendRefreshEnabled && lastRefreshTime && (
        <RefreshTimeLabel>
          {T.translate(`${PREFIX}.lastRefreshedAtLabel`, {
            datetime: format(lastRefreshTime, FORMAT_TYPES.TIMESTAMP_MILLIS),
          })}
        </RefreshTimeLabel>
      )}
      <Table data-testid="remote-pipelines-table" stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              {enableMultipleSelection && (
                <Checkbox
                  color="primary"
                  indeterminate={
                    selectedPipelines.length > 0 &&
                    selectedPipelines.length < remotePipelines.length
                  }
                  checked={selectedPipelines.length === remotePipelines.length}
                  onChange={handleSelectAllClick}
                  disabled={disabled}
                />
              )}
            </TableCell>
            <TableCell></TableCell>
            <StyledTableCell>
              {enableMultipleSelection ? (
                <TableSortLabel
                  active={sortBy === 'NAME'}
                  direction={sortBy === 'NAME' ? sortOrder.toLowerCase() : 'asc'}
                  onClick={handleSortByName}
                >
                  {T.translate(`${PREFIX}.pipelineName`)}
                </TableSortLabel>
              ) : (
                T.translate(`${PREFIX}.pipelineName`)
              )}
            </StyledTableCell>
            {enableMultipleSelection && (
              <>
                <StyledTableCell>
                  <TableSortLabel
                    active={sortBy === 'LAST_SYNCED_AT'}
                    direction={sortBy === 'LAST_SYNCED_AT' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={handleSortBySyncDate}
                  >
                    {T.translate(`${PREFIX}.lastSyncDate`)}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>{T.translate(`${PREFIX}.syncStatus`)}</StyledTableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {remotePipelines.map((pipeline: IRepositoryPipeline) => {
            if (showFailedOnly && !pipeline.error) {
              // only render pipelines that failed to pull
              return;
            }
            const isPipelineSelected = isSelected(pipeline.name);
            return (
              <StyledTableRow
                hover
                aria-checked={isPipelineSelected}
                key={pipeline.name}
                selected={isPipelineSelected}
                onClick={(e) => handleClick(e, pipeline.name)}
                data-testid={`remote-${pipeline.name}`}
                disabled={disabled}
              >
                <TableCell padding="checkbox">
                  <Checkbox color="primary" checked={isPipelineSelected} disabled={disabled} />
                </TableCell>
                <TableCell
                  style={{ width: '40px' }}
                  data-testid={
                    pipeline.status === SUPPORT.yes ? 'pull-success-status' : 'pull-failure-status'
                  }
                >
                  {pipeline.status !== null && (
                    <StatusButton
                      status={pipeline.status}
                      message={pipeline.status === SUPPORT.yes ? null : pipeline.error}
                      title={
                        pipeline.status === SUPPORT.yes
                          ? T.translate(`${PREFIX}.pullSuccess`, {
                              pipelineName: pipeline.name,
                            }).toLocaleString()
                          : T.translate(`${PREFIX}.pullFail`).toLocaleString()
                      }
                    />
                  )}
                </TableCell>
                <StyledTableCell>{pipeline.name}</StyledTableCell>
                {enableMultipleSelection && (
                  <>
                    <StyledTableCell>
                      {format(pipeline.lastSyncDate, FORMAT_TYPES.TIMESTAMP_MILLIS)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {pipeline.syncStatus ? (
                        <SyncStatusWrapper>
                          <CheckCircleIcon style={{ color: green[500] }} />
                          {T.translate(`${PREFIX}.gitSyncStatusSynced`)}
                        </SyncStatusWrapper>
                      ) : (
                        <SyncStatusWrapper>
                          <ErrorIcon style={{ color: red[500] }} />
                          {T.translate(`${PREFIX}.gitSyncStatusUnsynced`)}
                        </SyncStatusWrapper>
                      )}
                    </StyledTableCell>
                  </>
                )}
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
      {enableMultipleSelection && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="span"
          count={-1}
          rowsPerPage={pageSize}
          page={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handlePageSizeChange}
          labelDisplayedRows={({ from, to }) =>
            T.translate(`${PREFIX}.serverSidePaginationLabel`, {
              from,
              to: Math.min(to, currentPage * pageSize + remotePipelines.length),
            })
          }
          nextIconButtonProps={{ disabled: isLastRemotePipelinesPage() }}
        />
      )}
    </TableBox>
  );
};

/*
 * Copyright © 2018 Cask Data, Inc.
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

import React, { useEffect } from 'react';
import { connect, Provider } from 'react-redux';
import T from 'i18n-react';
import styled from 'styled-components';
import { green, orange } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import PipelineDetailStore from 'components/PipelineDetails/store';
import Tags from 'components/shared/Tags';
import IconSVG from 'components/shared/IconSVG';
import Popover from 'components/shared/Popover';
import { GLOBALS } from 'services/global-constants';
import { Chip } from '@material-ui/core';
import { useFeatureFlagDefaultFalse } from 'services/react/customHooks/useFeatureFlag';
import { getScmSyncStatus } from '../store/ActionCreator';
import moment from 'moment';

const PREFIX = 'features.PipelineDetails.TopPanel';
const SCM_PREFIX = 'features.SourceControlManagement';

const StyledSpan = styled.span`
  margin-left: 50px;
  display: flex;
`;

const StyledChip = styled(Chip)`
  height: 20px;
  margin-right: 10px;
`;

const mapStateToPipelineTagsProps = (state) => {
  const { name } = state;
  return {
    entity: {
      id: name,
      type: 'application',
    },
    showCountLabel: false,
    isNativeLink: true,
  };
};

const ConnectedPipelineTags = connect(mapStateToPipelineTagsProps)(Tags);

const mapStateToPipelineDetailsMetadataProps = (state) => {
  const { name, artifact, version, description, sourceControlMeta, scmSyncStatus } = state;
  return {
    name,
    artifactName: artifact.name,
    version,
    description,
    sourceControlMeta,
    scmSyncStatus,
  };
};

interface IPipelineDetailsMetadata {
  name: string;
  artifactName: string;
  version: string;
  description: string;
  sourceControlMeta: {
    fileHash: string;
  };
  scmSyncStatus?: {
    isSynced?: boolean;
    lastSyncedAt?: number;
  };
}

const PipelineDetailsMetadata = ({
  name,
  artifactName,
  version,
  description,
  sourceControlMeta,
  scmSyncStatus,
}: IPipelineDetailsMetadata) => {
  const scmMultiSyncEnabled = useFeatureFlagDefaultFalse(
    'source.control.management.multi.app.enabled'
  );

  useEffect(() => {
    if (name && scmMultiSyncEnabled) {
      getScmSyncStatus(name);
    }
  }, [name]);

  return (
    <div className="pipeline-metadata">
      <div className="pipeline-type-name-version">
        <span className="pipeline-type">
          {artifactName === GLOBALS.etlDataPipeline ? (
            <IconSVG name="icon-ETLBatch" />
          ) : (
            <IconSVG name="icon-sparkstreaming" />
          )}
        </span>
        <h1 className="pipeline-name" title={name}>
          {name}
        </h1>
        <span className="pipeline-description">
          <Popover
            target={() => <IconSVG name="icon-info-circle" />}
            showOn="Hover"
            placement="bottom"
          >
            {description}
          </Popover>
        </span>
        {!scmMultiSyncEnabled && sourceControlMeta && sourceControlMeta.fileHash && (
          <StyledSpan>
            <StyledChip variant="outlined" label={T.translate(`${SCM_PREFIX}.table.gitStatus`)} />
            <Popover
              target={() => <IconSVG name="icon-info-circle" />}
              showOn="Hover"
              placement="bottom"
            >
              {T.translate(`${SCM_PREFIX}.table.gitStatusHelperText`)}
            </Popover>
          </StyledSpan>
        )}
        {scmMultiSyncEnabled && scmSyncStatus && (
          <StyledSpan>
            {scmSyncStatus.isSynced ? (
              <StyledChip
                variant="outlined"
                label={T.translate(`${SCM_PREFIX}.table.gitSyncStatusSynced`)}
                icon={<CheckCircleIcon style={{ color: green[500] }} fontSize="small" />}
                title={
                  scmSyncStatus.lastSyncedAt
                    ? T.translate(`${SCM_PREFIX}.table.lastSyncedAtRelative`, {
                        diff: moment(scmSyncStatus.lastSyncedAt).fromNow(true),
                      })
                    : undefined
                }
              />
            ) : (
              <StyledChip
                variant="outlined"
                label={T.translate(`${SCM_PREFIX}.table.gitSyncStatusUnsynced`)}
                icon={<ErrorIcon style={{ color: orange[300] }} fontSize="small" />}
                title={
                  scmSyncStatus.lastSyncedAt
                    ? T.translate(`${SCM_PREFIX}.table.lastSyncedAtRelative`, {
                        diff: moment(scmSyncStatus.lastSyncedAt).fromNow(true),
                      })
                    : undefined
                }
              />
            )}
            <Popover
              target={() => <IconSVG name="icon-info-circle" />}
              showOn="Hover"
              placement="bottom"
            >
              {T.translate(`${SCM_PREFIX}.table.syncStatusHelperText`)}
            </Popover>
          </StyledSpan>
        )}
        <span className="pipeline-version">{T.translate(`${PREFIX}.version`, { version })}</span>
      </div>
      <div className="pipeline-tags">
        <ConnectedPipelineTags />
      </div>
    </div>
  );
};

const ConnectedPipelineDetailsMetadata = connect(mapStateToPipelineDetailsMetadataProps)(
  PipelineDetailsMetadata
);

const ProvidedPipelineDetailsMetadata = () => {
  return (
    <Provider store={PipelineDetailStore}>
      <ConnectedPipelineDetailsMetadata />
    </Provider>
  );
};

export default ProvidedPipelineDetailsMetadata;

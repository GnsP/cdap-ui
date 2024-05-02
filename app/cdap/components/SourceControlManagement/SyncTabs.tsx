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

import { Tab, Tabs } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LocalPipelineListView } from './LocalPipelineListView';
import styled from 'styled-components';
import T from 'i18n-react';
import { RemotePipelineListView } from './RemotePipelineListView';
import { FeatureProvider } from 'services/react/providers/featureFlagProvider';
import {
  getNamespacePipelineList,
  getNamespacePipelineListV2,
  getRemotePipelineList,
  getRemotePipelineListV2,
} from './store/ActionCreator';
import { getCurrentNamespace } from 'services/NamespaceStore';
import { useFeatureFlagDefaultFalse } from 'services/react/customHooks/useFeatureFlag';

const PREFIX = 'features.SourceControlManagement';

const StyledDiv = styled.div`
  padding: 4px 10px;
`;

const StyledTabs = styled(Tabs)`
  border-bottom: 1px solid #e8e8e8;
`;

const ScmSyncTabs = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const multiOpEnabled = useFeatureFlagDefaultFalse('source.control.management.multi.app.enabled');
  const ns = getCurrentNamespace();

  function fetchNamespacePipelines(nameFilterStr: string) {
    if (multiOpEnabled) {
      getNamespacePipelineListV2(ns);
    } else {
      getNamespacePipelineList(ns, nameFilterStr);
    }
  }

  function fetchRemotePipelines() {
    if (multiOpEnabled) {
      getRemotePipelineListV2(ns);
    } else {
      getRemotePipelineList(ns);
    }
  }

  const { nameFilter } = useSelector(({ push }) => push);
  const handleTabChange = (e, newValue) => {
    setTabIndex(newValue);
    // refetch latest pipeline data, while displaying possibly stale data
    if (newValue === 0) {
      fetchNamespacePipelines(nameFilter);
    } else {
      fetchRemotePipelines();
    }
  };

  return (
    <>
      <StyledDiv>
        <StyledTabs
          value={tabIndex}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab data-testid="local-pipeline-tab" label={T.translate(`${PREFIX}.push.tab`)} />
          <Tab data-testid="remote-pipeline-tab" label={T.translate(`${PREFIX}.pull.tab`)} />
        </StyledTabs>
      </StyledDiv>
      <FeatureProvider>
        <StyledDiv>
          {tabIndex === 0 ? <LocalPipelineListView /> : <RemotePipelineListView />}
        </StyledDiv>
      </FeatureProvider>
    </>
  );
};

export default ScmSyncTabs;

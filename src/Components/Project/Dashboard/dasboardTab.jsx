import React, { useMemo } from 'react';
import './Styles/dashboard.scss';
import { useLocation } from 'react-router-dom';

import ScrollableToggleGroup from '../../Common/ScrollableToggleGroup';

const DasboardTab = ({ tabData, selectedTab, handleChange, decodedData }) => {
  const locction = useLocation();
  const hasTaskId = !!decodedData?.taskid;
  const hiddenTabsWithoutTaskId = ['Team Member', 'Comments', 'Master Bind'];
  const filteredTabData = useMemo(
    () =>
      (tabData || []).filter(
        (item) => hasTaskId || !hiddenTabsWithoutTaskId.includes(item.label)
      ),
    [tabData, hasTaskId]
  );

  const items = useMemo(
    () =>
      filteredTabData?.map((item) => ({
        value: item.label,
        label: item.count > 0 ? `${item.label}(${item.count})` : item.label,
      })) || [],
    [filteredTabData]
  );

  return (
    <ScrollableToggleGroup
      containerClassName="prDashboard_ToggleBox"
      items={items}
      value={selectedTab}
      onChange={handleChange}
      minButtonWidth={locction?.pathname?.includes('/projects/') ? '192px' : '110px'}
      scrollAmount={192}
    />
  );
};

export default DasboardTab;

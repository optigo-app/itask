import { Box, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import './Styles/dashboard.scss';
import { useLocation } from 'react-router-dom';

const DasboardTab = ({ tabData, selectedTab, handleChange, decodedData }) => {
  const locction = useLocation();
  const scrollRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const hasTaskId = !!decodedData?.taskid;

  const hiddenTabsWithoutTaskId = ['Team Member', 'Comments'];

  const filteredTabData = tabData.filter(
    (item) => hasTaskId || !hiddenTabsWithoutTaskId.includes(item.label)
  );


  useEffect(() => {
    if (tabData.length > 7) {
      setShowScrollButtons(true);
    }
  }, [tabData]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
      }
    };

    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      checkScroll(); // Initial check
    }

    return () => {
      if (ref) {
        ref.removeEventListener('scroll', checkScroll);
      }
    };
  }, []);

  const handleScroll = (direction) => {
    const scrollAmount = 192;
    if (scrollRef.current) {
      const newScroll =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  return (
    <Box className="prDashboard_ToggleBox" display="flex" alignItems="center">
      {showScrollButtons && (
        <IconButton
          onClick={() => handleScroll('left')}
          className={`scroll-btn left-btn ${canScrollLeft ? 'active' : ''}`}
        >
          <ChevronLeft />
        </IconButton>
      )}

      <Box
        ref={scrollRef}
        className="toggle-scroll-container"
        sx={{
          overflowX: 'auto',
          display: 'flex',
          flexGrow: 1,
          scrollBehavior: 'smooth',
        }}
      >
        <ToggleButtonGroup
          value={selectedTab}
          exclusive
          onChange={handleChange}
          aria-label="dashboard tab selection"
          className="toggle-group"
        >
          {filteredTabData?.map((item) => (
            <ToggleButton key={item.label} value={item.label} className="toggle-button" sx={{ minWidth: locction?.pathname?.includes('/projects/') ? "192px !important" : '110px !important' }}>
              {item.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {showScrollButtons && (
        <IconButton
          onClick={() => handleScroll('right')}
          className={`scroll-btn right-btn ${canScrollRight ? 'active' : ''}`}
        >
          <ChevronRight />
        </IconButton>
      )}
    </Box>
  );
};

export default DasboardTab;

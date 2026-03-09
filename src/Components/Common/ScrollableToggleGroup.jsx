import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const ScrollableToggleGroup = ({
  items,
  value,
  onChange,
  itemKey = (item) => item?.value,
  itemValue = (item) => item?.value,
  itemLabel = (item) => item?.label,
  minButtonWidth = '110px',
  scrollAmount = 192,
  containerClassName,
  containerSx,
  toggleGroupClassName = 'toggle-group',
  toggleButtonClassName = 'toggle-button',
  showScrollButtonsWhen = (itemsArr) => (itemsArr?.length || 0) > 7,
}) => {
  const scrollRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const normalizedItems = useMemo(() => items || [], [items]);

  useEffect(() => {
    setShowScrollButtons(!!showScrollButtonsWhen?.(normalizedItems));
  }, [normalizedItems, showScrollButtonsWhen]);

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);

      const hasOverflow = scrollWidth > clientWidth + 1;
      setShowScrollButtons(hasOverflow);
    };

    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
    }

    const resizeObserver = new ResizeObserver(() => checkScroll());
    if (ref) resizeObserver.observe(ref);

    // initial
    checkScroll();

    return () => {
      if (ref) {
        ref.removeEventListener('scroll', checkScroll);
      }
      resizeObserver.disconnect();
    };
  }, [normalizedItems]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const newScroll =
      direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
    scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  return (
    <Box
      className={containerClassName}
      display="flex"
      alignItems="center"
      sx={{ overflow: 'hidden', ...(containerSx || {}) }}
    >
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
          minWidth: 0,
          scrollBehavior: 'smooth',
        }}
      >
        <ToggleButtonGroup
          value={value}
          exclusive
          onChange={onChange}
          aria-label="scrollable toggle group"
          className={toggleGroupClassName}
        >
          {normalizedItems?.map((item) => (
            <ToggleButton
              key={itemKey(item)}
              value={itemValue(item)}
              className={toggleButtonClassName}
              sx={{ minWidth: `${minButtonWidth} !important`, flex: '0 0 auto' }}
            >
              {itemLabel(item)}
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

export default ScrollableToggleGroup;

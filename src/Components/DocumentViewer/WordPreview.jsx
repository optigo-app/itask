import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import * as mammoth from 'mammoth';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';

const WordPreview = ({ url, filename, fileObject, zoomLevel = 1 }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadWordDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        let arrayBuffer;

        if (fileObject) {
          arrayBuffer = await fileObject.arrayBuffer();
        } else if (url) {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } else {
          throw new Error('No file source provided');
        }
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            // Constrain embedded images so large ones don't overflow the page
            convertImage: mammoth.images.imgElement((image) =>
              image.read('base64').then((imageBuffer) => ({
                src: `data:${image.contentType};base64,${imageBuffer}`,
                style: 'max-width:100%;height:auto;display:block;',
              }))
            ),
          }
        );
        setHtmlContent(result.value);
        if (result.messages.length > 0) {
          console.log('Mammoth conversion messages:', result.messages);
        }
        // Focus the scroll container so arrow keys / PageUp / PageDown scroll the doc
        requestAnimationFrame(() => scrollRef.current?.focus());
      } catch (err) {
        console.error('Error loading Word document:', err);
        setError(err.message || 'Failed to load Word document');
      } finally {
        setLoading(false);
      }
    };

    loadWordDocument();
  }, [url, fileObject]);

  if (loading) {
    return (
      <LoadingBackdrop isLoading={loading} />
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        p={2}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="body2">
            Error loading Word document: {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      ref={scrollRef}
      tabIndex={0}
      className="word-preview-container"
      sx={{
        height: '100%',
        overflow: 'auto',
        bgcolor: '#f3f3f3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 2,
        outline: 'none',
      }}
    >
      <Box
        sx={{
          mt: 1,
          mb: 3,
          bgcolor: '#ffffff',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.12)',
          borderRadius: 1,
          width: '100%',
          maxWidth: 900,
          minHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          // CSS zoom scales layout (not just paint like transform) - keeps scroll/focus working
          zoom: zoomLevel,
          // Scoped fixes for mammoth-generated markup so nothing overflows the page
          '& .wordPreviewContent': {
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            '& img': {
              maxWidth: '100%',
              height: 'auto',
            },
            '& table': {
              display: 'block',
              maxWidth: '100%',
              overflowX: 'auto',
              borderCollapse: 'collapse',
            },
            '& td, & th': {
              overflowWrap: 'break-word',
              minWidth: '60px',
            },
            '& pre': {
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            },
          },
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="wordPreviewContent"
          style={{ width: '100%', padding: '32px 40px', boxSizing: 'border-box' }}
        />
      </Box>
    </Box>
  );
};

export default WordPreview;
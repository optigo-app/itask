import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import * as mammoth from 'mammoth';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';

const WordPreview = ({ url, filename, fileObject }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
        if (result.messages.length > 0) {
          console.log('Mammoth conversion messages:', result.messages);
        }
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
      sx={{
        height: '100%',
        overflow: 'auto',
        bgcolor: '#f3f3f3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 2,
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
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="wordPreviewContent"
          style={{ width: '100%' }}
        />
      </Box>
    </Box>
  );
};

export default WordPreview;
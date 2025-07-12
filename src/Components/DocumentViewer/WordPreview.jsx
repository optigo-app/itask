import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import * as mammoth from 'mammoth';
import { toast } from 'react-toastify';
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
          // If we have the file object directly
          arrayBuffer = await fileObject.arrayBuffer();
        } else if (url) {
          // If we have a URL, fetch the file
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } else {
          throw new Error('No file source provided');
        }

        // Convert Word document to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);

        // Log any messages from mammoth (warnings, etc.)
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
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="wordPreviewContent"
      />
    </Box>
  );
};

export default WordPreview;
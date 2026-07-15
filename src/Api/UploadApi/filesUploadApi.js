import axios from 'axios';
import { UPLOAD_URL } from '../InitialApi/config';
import { getAbortSignal } from '../../Utils/requestAbortController';

export const filesUploadApi = async ({ attachments, folderName, uniqueNo }) => {
  const { ukey } = JSON.parse(sessionStorage.getItem('taskInit'));
  const formData = new FormData();

  attachments?.forEach((item) => {
    if (item.file) {
      formData.append('fileType', item.file); // File
    } else if (item.url) {
      formData.append('urls', item.url); // Optional: URL
    }
  });

  formData.append('folderName', folderName);
  formData.append('uKey', ukey);
  formData.append('uniqueNo', uniqueNo);

  try {
    const response = await axios.post(UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: getAbortSignal(),
    });

    return response.data;
  } catch (error) {
    if (axios.isCancel?.(error) || error.name === 'AbortError') {
      return null;
    }
    console.error('File upload failed:', error);
    throw error;
  }
};

import axios from 'axios';

export const filesUploadApi = async ({ attachments, folderName, uniqueNo }) => {
  debugger
  const isLocal = ["localhost", "nzen"]?.includes(
    window.location.hostname
  );
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

  let APIURL = isLocal ? 'http://nextjstest.web/api/upload' : 'https://livenx.optigoapps.com/api/upload';

  try {
    const response = await axios.post(APIURL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

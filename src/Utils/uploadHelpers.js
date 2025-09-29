import { filesUploadApi } from "../Api/UploadApi/filesUploadApi";
import { filesUploadSaveApi } from "../Api/UploadApi/filesUploadSaveApi";

// Upload multiple files for comments and return structured data like SidebarDrawerFile
// Usage: await uploadFilesForComment({ folderName, files })
export const uploadFilesForComment = async ({
  folderName = "Comments",
  files = [],
}) => {
  try {
    const uploadedResults = [];

    for (const file of files) {
      const res = await filesUploadApi({
        attachments: [{ file }],
        folderName,
        uniqueNo: file?.name?.split(".")?.[0] || `${Date.now()}`,
      });
      if (res?.files && Array.isArray(res.files)) {
        uploadedResults.push(...res.files);
      }
    }

    // Structure data like SidebarDrawerFile for consistency
    const attachments = [{
      folderName,
      documents: [{
        documents: uploadedResults.map(f => f.url).join(','),
        documentsurl: '',
      }]
    }];

    return {
      success: true,
      uploaded: uploadedResults,
      urls: uploadedResults.map((f) => f.url),
      attachments, // Structured like SidebarDrawerFile
    };
  } catch (error) {
    console.error("uploadFilesForComment error:", error);
    return { success: false, error, urls: [], attachments: [] };
  }
};

// Upload files via upload API, then save them against a task via save API
// Usage: await uploadAndSaveTaskAttachments({ taskId, folderName, files, urls })
export const uploadAndSaveTaskAttachments = async ({
  taskId,
  folderName = "Comments",
  files = [],
  urls = [],
}) => {
  try {
    const uploadedResults = [];

    for (const file of files) {
      const res = await filesUploadApi({
        attachments: [{ file }],
        folderName,
        uniqueNo: file?.name?.split(".")?.[0] || `${Date.now()}`,
      });
      if (res?.files && Array.isArray(res.files)) {
        uploadedResults.push(...res.files);
      }
    }

    const attachmentsPayload = [
      {
        folderName,
        documents: [
          {
            documents: uploadedResults.map((f) => f.url).join(","),
            documentsurl: (urls || []).join(","),
          },
        ],
      },
    ];

    const saveRes = await filesUploadSaveApi(attachmentsPayload, taskId);
    const success = saveRes?.rd?.[0]?.stat == 1;

    return {
      success,
      saveResponse: saveRes,
      uploaded: uploadedResults,
    };
  } catch (error) {
    console.error("uploadAndSaveTaskAttachments error:", error);
    return { success: false, error };
  }
};

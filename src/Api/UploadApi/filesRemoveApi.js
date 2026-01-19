import { apiClient } from '../InitialApi/CommonApi';
import { REMOVE_FILE_URL } from '../InitialApi/config';

export const removeFileApi = async ({ attachments }) => {
    const data = {
        imageUrl: attachments,
    };
    try {
        const response = await apiClient.post(REMOVE_FILE_URL, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity,
        });
        return response
    } catch (error) {
        console.error('File remove failed:', error);
    }
};

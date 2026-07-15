import axios from 'axios';
import { REMOVE_FILE_URL } from '../InitialApi/config';
import { getAbortSignal } from '../../Utils/requestAbortController';

export const removeFileApi = async ({ attachments }) => {
    const data = {
        imageUrl: attachments,
    };
    try {
        const response = await axios.post(REMOVE_FILE_URL, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity,
            signal: getAbortSignal(),
        });
        return response
    } catch (error) {
        if (axios.isCancel?.(error) || error.name === 'AbortError') {
            return null;
        }
        console.error('File remove failed:', error);
    }
};

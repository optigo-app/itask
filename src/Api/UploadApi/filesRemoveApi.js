import axios from 'axios';

export const removeFileApi = async ({ attachments }) => {
    const isLocal = ["localhost", "nzen"]?.includes(
        window.location.hostname
    );
    const data = {
        imageUrl: attachments,
    };
    let APIURL = isLocal ? 'http://newnextjs.web/api/removefile' : 'https://livenx.optigoapps.com/api/removefile';
    try {
        const response = await axios.post(APIURL, data, {
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

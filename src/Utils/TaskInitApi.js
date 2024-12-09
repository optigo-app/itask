import axios from 'axios';

export const taskInit = async () => {
    const APIURL = (window.location.hostname === 'localhost' || window.location.hostname === 'zen')
        ? "http://zen/api/report.aspx"
        : "https://api.optigoapps.com/ReactStore/ReactStore.aspx";

    const headers = {
        Authorization: '',
        YearCode: 'e3t6ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0=',
        version: 'v4',
        sv: 0
    };

    try {
        const body = {
            con: "{\"id\":\"\",\"mode\":\"gettoken\"}",
            p: "",
            f: "init api for initialization",
        };

        const response = await axios.post(APIURL, body, { headers });

        if (response?.data?.Data?.rd) {
            const rdData = response.data.Data.rd[0];
            localStorage.setItem('taskInit', JSON.stringify(rdData));
        } else {
            console.warn('No `rd` data found in response:', response);
        }
        return response.data;
    } catch (error) {
        console.error('Error in taskInit:', error);
        return null;
    }
};

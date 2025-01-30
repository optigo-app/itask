import axios from 'axios';

export const taskInit = async () => {
    const APIURL = (window.location.hostname === 'localhost' || window.location.hostname === 'zen')
        ? "http://zen/api/report.aspx"
        : "https://api.optigoapps.com/ALL/report.aspx";

    const headers = {
        Authorization: '',
        YearCode: (window.location.hostname === 'localhost' || window.location.hostname === 'zen') ?
        'e3t6ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0=' : 'e3tsaXZlLm9wdGlnb2FwcHMuY29tfX17ezIwfX17e3Byb2l0YXNrfX17e3Byb2l0YXNrfX0=',
        version: 'v4',
        sv: (window.location.hostname === 'localhost' || window.location.hostname === 'zen') ? '0' : '1'
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
            sessionStorage.setItem('taskInit', JSON.stringify(rdData));
        } else {
            console.warn('No `rd` data found in response:', response);
        }
        return response.data;
    } catch (error) {
        console.error('Error in taskInit:', error);
        return null;
    }
};

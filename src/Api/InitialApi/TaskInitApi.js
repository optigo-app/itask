import axios from 'axios';

export const taskInit = async () => {
    const isLocal = ["localhost", "zen", "itask.web"].includes(window.location.hostname);
    const APIURL = isLocal
        ? "http://zen/api/report.aspx"
        : "https://api.optigoapps.com/ALL/report.aspx";

    const headers = {
        Authorization: '',
        YearCode: isLocal
            ? 'e3t6ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0='
            : 'e3tsaXZlLm9wdGlnb2FwcHMuY29tfX17ezIwfX17e3Byb2l0YXNrfX17e3Byb2l0YXNrfX0=',
        version: 'v4',
        sv: isLocal ? '0' : '1',
    };

    const body = {
        con: JSON.stringify({ id: "", mode: "gettoken" }),
        p: "",
        f: "init api for initialization",
    };

    try {
        const { data } = await axios.post(APIURL, body, { headers });

        if (data?.Data?.rd?.[0]) {
            sessionStorage.setItem('taskInit', JSON.stringify(data.Data.rd[0]));
        } else {
            console.warn('No `rd` data found in response:', data);
        }

        return data;
    } catch (error) {
        console.error('Error in taskInit:', error.message || error);
        return null;
    }
};
             
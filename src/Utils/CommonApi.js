
import axios from "axios";
const APIURL = (window.location.hostname === 'localhost' || window.location.hostname === 'zen') ? "http://zen/api/report.aspx" : 'https://api.optigoapps.com/ALL/report.aspx';

export const CommonAPI = async (body) => {
    const init = JSON.parse(localStorage.getItem('taskInit'));
    try {
        const YearCode = init?.YearCode ?? (window.location.hostname === 'localhost' || window.location.hostname === 'zen') ?
            'e3t6ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0=' : 'e3tsaXZlLm9wdGlnb2FwcHMuY29tfX17ezIwfX17e3Byb2l0YXNrfX17e3Byb2l0YXNrfX0='
        const version = init?.version ?? 'v4';
        const token = init?.token ?? '';
        const sv = init?.sv ?? (window.location.hostname === 'localhost' || window.location.hostname === 'zen') ? '0' : '1';

        const header = {
            Authorization: `Bearer ${token}`,
            Yearcode: YearCode,
            Version: version,
            sv: sv
        };
        const response = await axios.post(APIURL, body, { headers: header });
        return response?.data;

    } catch (error) {
        console.error('error is..', error);
    }
};


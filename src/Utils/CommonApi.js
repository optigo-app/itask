
import axios from "axios";
const APIURL = (window.location.hostname === 'localhost' || window.location.hostname === 'zen') ? "http://zen/api/report.aspx" : 'https://api.optigoapps.com/ReactStore/ReactStore.aspx';

export const CommonAPI = async (body) => {
    const init = JSON.parse(localStorage.getItem('taskInit'));
    try {
        const YearCode = init?.YearCode ?? 'e3t6ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0=';
        const version = init?.version ?? 'v4';
        const token = init?.token ?? '';
        const sv = init?.sv ?? '0';

        const header = {
            Authorization: `Bearer ${token}`,
            Yearcode: YearCode,
            Version: version,
            sp: "1",
            sv: sv
        };
        const response = await axios.post(APIURL, body, { headers: header });
        return response?.data;

    } catch (error) {
        console.error('error is..', error);
    }
};


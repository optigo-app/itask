import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";
import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchDocsEstimateReportApi = async (orderBy = "order by StDate asc", pageSize = "100", currentPage = "1", filter = {}) => {
    try {
        const AuthData = getAuthData();
        const ipAddress = await getClientIpAddress();

        const {
            pageSize: _ignoredPageSize,
            currentPage: _ignoredCurrentPage,
            PageSize: _ignoredPageSizeCaps,
            CurrentPage: _ignoredCurrentPageCaps,
            ...flatFilterParams
        } = filter || {};

        const combinedValue = JSON.stringify({
            OrderBy: orderBy,
            PageSize: pageSize,
            CurrentPage: currentPage,
            Seniourid: "0",
            Empid: "0",
            search: "",
            ...flatFilterParams,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"DOCESTIMATE\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (taskmaster)",
            "p": combinedValue,
        };

        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching Docs Estimate Report:', error);
        return [];
    }
};

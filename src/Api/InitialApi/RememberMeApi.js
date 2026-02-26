import { getProfileFromCookie } from "../../Utils/globalfun";
import { CommonAPI } from "../InitialApi/CommonApi";
import Cookies from 'js-cookie';

export const GetRememberMeApi = async () => {
    const userData = getProfileFromCookie();
    try {
        const combinedValue = JSON.stringify({
            UserId: userData?.userid ?? '',
        });

        const body = {
            "con": "{\"id\":\"\",\"mode\":\"RememberMeLogin\"}",
            "f": "Task Management (RememberMeLogin)",
            "p": combinedValue,
        };
        const sv = parseInt(userData?.sv) || 0;

        const response = await CommonAPI(body, {
            headers: { sv },
            includeAuth: false,
            includeSp: false,
            useCookieDt: true,
            skipTokenUpdate: true,
        });

        const requestToken = response?.Data?.RequestToken;
        if (requestToken) {
            const tokenWithBearer = requestToken.startsWith('Bearer ')
                ? requestToken
                : `Bearer ${requestToken}`;

            const cookieDomain = (typeof window !== 'undefined' && window?.location?.hostname?.endsWith('optigoapps.com'))
                ? '.optigoapps.com'
                : undefined;
            const cookieOptions = cookieDomain ? { domain: cookieDomain } : {};

            let expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            try {
                const expRaw = sessionStorage.getItem('CookieExpirationTime');
                if (expRaw) {
                    const expAsDate = new Date(expRaw);
                    if (!Number.isNaN(expAsDate.getTime())) {
                        expiresAt = expAsDate;
                    } else {
                        const expMinutes = Number(expRaw);
                        if (!Number.isNaN(expMinutes) && expMinutes > 0) {
                            expiresAt = new Date(Date.now() + expMinutes * 60 * 1000);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to read CookieExpirationTime:', e);
            }

            Cookies.set('auth', tokenWithBearer, { ...cookieOptions, expires: expiresAt });

            const dtCookie = Cookies.get('dt');
            if (dtCookie) {
                Cookies.set('dt', dtCookie, { ...cookieOptions, expires: expiresAt });
            }
        }
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }

    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
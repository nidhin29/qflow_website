const BASE_URL = "https://backend.devforchange.com/api/v1";
console.log(BASE_URL);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw { response: { data }, status: response.status };
    }
    return { data, status: response.status };
};

const customFetch = async (url, options) => {
    try {
        let response = await fetch(`${BASE_URL}${url}`, {
            ...options,
            credentials: 'include'
        });

        if (response.status === 401 && !url.includes('/login') && !url.includes('/refresh-token')) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return fetch(`${BASE_URL}${url}`, { ...options, credentials: 'include' });
                }).then(res => handleResponse(res));
            }

            isRefreshing = true;

            const refreshResponse = await fetch(`${BASE_URL}/hospital/refresh-token`, {
                method: 'POST',
                credentials: 'include'
            });

            if (refreshResponse.ok) {
                isRefreshing = false;
                processQueue(null);

                // Retry requested fetch
                response = await fetch(`${BASE_URL}${url}`, {
                    ...options,
                    credentials: 'include'
                });
            } else {
                isRefreshing = false;
                processQueue(new Error('Refresh token invalid'));
                localStorage.clear();
                window.location.href = '/login';
                throw { status: 401, message: 'Session Expired' };
            }
        }

        return await handleResponse(response);
    } catch (error) {
        if (error.status === 401 && url.includes('/refresh-token')) {
            localStorage.clear();
            window.location.href = '/login';
        }
        throw error;
    }
};

const api = {
    get: (url, options = {}) => customFetch(url, { method: 'GET', ...options }),

    post: (url, body, options = {}) => {
        const isFormData = body instanceof FormData;
        const headers = {
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            ...options.headers,
        };
        return customFetch(url, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body),
            ...options
        });
    },

    put: (url, body, options = {}) => {
        const isFormData = body instanceof FormData;
        const headers = {
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            ...options.headers,
        };
        return customFetch(url, {
            method: 'PUT',
            headers,
            body: isFormData ? body : JSON.stringify(body),
            ...options
        });
    },

    delete: (url, options = {}) => customFetch(url, { method: 'DELETE', ...options })
};

export default api;

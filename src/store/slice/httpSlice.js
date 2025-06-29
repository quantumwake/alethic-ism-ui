// httpSlice.js
import standardFetchFactory from "../standardFetch";
import authFetchFactory from '../authFetch'

const useHttpSlice = (set, get) => {
    const fetchAuth = authFetchFactory(set, get)
    const standardFetch = standardFetchFactory(set, get)

    const jsonHeaders = { 'Content-Type': 'application/json' }

    // helper to build full URL
    const buildUrl = url => {
        const base = get().ISM_API_BASE_URL || ''
        return url.startsWith('http') ? url : `${base}${url}`
    }

    return {
        // error bucket
        errors: [],

        addError: err => set(state => ({ errors: [...state.errors, err] })),
        clearErrors: () => set({ errors: [] }),

        authDownloadFile: async(url, filename = null) => {
            const token = get().jwtToken; // assume you already have jwtToken in state
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`Download failed: ${res.status} ${text}`);
            }

            // read as blob
            const blob = await res.blob();

            // determine filename
            let suggestedName = filename;
            if (!suggestedName) {
                const cd = res.headers.get("Content-Disposition");
                if (cd) {
                    const match = cd.match(/filename="?(.+?)"?($|;)/);
                    if (match) suggestedName = match[1];
                }
                if (!suggestedName) suggestedName = "download";
            }

            // 4. Trigger browser download
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = suggestedName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);
            return res
        },

        fetch: async (url, opts) => {
            try {
                const fullUrl = buildUrl(url)
                const res = await standardFetch(fullUrl, opts)
                if (!res.ok) {
                    const text = await res.text().catch(() => '')
                    get().addError({ 
                        url: fullUrl, 
                        method: opts?.method || 'GET',
                        body: opts?.body || null,
                        status: res.status, 
                        message: text 
                    })
                }
                return res
            } catch (err) {
                get().addError({ 
                    url: buildUrl(url), 
                    method: opts?.method || 'GET',
                    body: opts?.body || null,
                    message: err.message || err 
                })
                throw err
            }
        },

        authFetch: async (url, opts) => {
            try {
                const fullUrl = buildUrl(url)
                const res = await fetchAuth(fullUrl, opts)
                if (!res.ok) {
                    const text = await res.text().catch(() => '')
                    get().addError({ 
                        url: fullUrl, 
                        method: opts?.method || 'GET',
                        body: opts?.body || null,
                        status: res.status, 
                        message: text 
                    })
                }
                return res
            } catch (err) {
                get().addError({ 
                    url: buildUrl(url), 
                    method: opts?.method || 'GET',
                    body: opts?.body || null,
                    message: err.message || err 
                })
                throw err
            }
        },


        noAuthGet: (url, opts = {}) => get().fetch(url, { method: 'GET', ...opts }),
        authGet: (url, opts = {}) =>  get().authFetch(url, { method: 'GET', ...opts }),

        noAuthPost: (url, body, opts = {}) =>
            get().fetch(url, {
                method: 'POST',
                headers: {...jsonHeaders, ...opts.headers},
                body: JSON.stringify(body),
                ...opts,
            }),

        authPost: (url, body, opts = {}) =>
            get().authFetch(url, {
                method: 'POST',
                headers: { ...jsonHeaders, ...opts.headers },
                body: JSON.stringify(body),
                ...opts,
            }),


        noAuthPut: (url, body, opts = {}) =>
            get().fetch(url, {
                method: 'PUT',
                headers: { ...jsonHeaders, ...opts.headers },
                body: body,
                ...opts,
            }),

        authPut: (url, body, opts = {}) =>
            get().authFetch(url, {
                method: 'PUT',
                headers: { ...jsonHeaders, ...opts.headers },
                body: body,
                ...opts,
            }),

        noAuthDelete: (url, body, opts = {}) =>
            get().fetch(url, {
                method: 'DELETE',
                headers: { ...jsonHeaders, ...opts.headers },
                body: JSON.stringify(body),
                ...opts,
            }),

        authDelete: (url, body, opts = {}) =>
            get().authFetch(url, {
                method: 'DELETE',
                headers: { ...jsonHeaders, ...opts.headers },
                body: JSON.stringify(body),
                ...opts,
            }),

    }
}

export default useHttpSlice
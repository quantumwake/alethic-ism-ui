// httpSlice.js
import authFetchFactory from '../authFetch'

const useHttpSlice = (set, get) => {
    const fetchAuth = authFetchFactory(set, get)
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

        authFetch: async (url, opts) => {
            try {
                const res = await fetchAuth(buildUrl(url), opts)
                if (!res.ok) {
                    const text = await res.text().catch(() => '')
                    get().addError({ url, status: res.status, message: text })
                }
                return res
            } catch (err) {
                get().addError({ url, message: err.message || err })
                throw err
            }
        },


        authGet: (url, opts = {}) =>
            get().authFetch(url, { method: 'GET', ...opts }),

        authPost: (url, body, opts = {}) =>
            get().authFetch(url, {
                method: 'POST',
                headers: { ...jsonHeaders, ...opts.headers },
                body: JSON.stringify(body),
                ...opts,
            }),

        authPut: (url, body, opts = {}) =>
            get().authFetch(url, {
                method: 'PUT',
                headers: { ...jsonHeaders, ...opts.headers },
                body: body,
                ...opts,
            }),

        authDelete: (url, opts = {}) =>
            get().authFetch(url, { method: 'DELETE', ...opts }),
    }
}

export default useHttpSlice
export const useHuggingFaceSlice = (set, get) => ({

    importHgDataset: async (stateId, path, revision, split, subset) => {
        if (!stateId) {
            console.warn("No state id specified");
            return null
        }

        // TODO need to assign a vault key id representing the users hugging face token reference
        const vaultKeyId = ""

        try {

            const response = await fetch(`${get().ISM_API_BASE_URL}/dataset/state/${stateId}/load/hg`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "path": path,
                    "revision": revision,
                    "split": split,
                    "subset": subset,
                    "vaultKeyId": vaultKeyId
                })
            })

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error(error);
        }
        return null
    }

});

export default useHuggingFaceSlice


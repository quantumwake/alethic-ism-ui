export const useHuggingFaceSlice = (set, get) => ({

    importHgDataset: async (stateId, path, revision, split, subset) => {
        if (!stateId) {
            console.warn("No state id specified");
            return null
        }

        // TODO need to assign a vault key id representing the users hugging face token reference
        const vaultKeyId = ""

        try {
            const response = await get().authPost(
                `/dataset/state/${stateId}/load/hg`,
                {
                    path: path,
                    revision: revision,
                    split: split,
                    subset: subset,
                    vaultKeyId: vaultKeyId
                }
            )

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error(error);
        }
        return null
    },

    exportHgDataset: async (stateId, namespace, datasetName, isPrivate, commitMessage, revision) => {
        if (!stateId) {
            console.warn("No state id specified");
            return null
        }

        if (!namespace) {
            console.warn("No namespace specified");
            return null
        }

        // TODO need to assign a vault key id representing the users hugging face token reference
        const vaultKeyId = ""

        try {
            const response = await get().authPost(
                `/dataset/state/${stateId}/push/hg`,
                {
                    namespace: namespace,
                    dataset_name: datasetName,
                    private: isPrivate,
                    commit_message: commitMessage,
                    revision: revision,
                    vaultKeyId: vaultKeyId
                }
            )

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


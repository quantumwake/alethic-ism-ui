import {FileCode, FileText, Folder} from "lucide-react";

const tempFunc = (name, label, templates, callbackFn) => {
    const filtered = templates.filter(t => t.template_type === name)
    if (!filtered) {
        return []
    }

    const children = filtered.map((t) => {
        return {
            id: t.template_id,
            label: t.template_path,
            icon: FileCode,
            type: 'file',
            callbackFn: callbackFn
        }
    })

    return { id: name, label: label, icon: Folder, type: 'folder',  children: children }
}

export const createFileSystemSlice = (set, get) => ({
    selectedFileId: null,
    setSelectedFileId: (userId) => set({ selectedFileId: userId }),
    projectFileSystem: [],
    setProjectFileSystem: (projectFileSystem) => set({projectFileSystem: projectFileSystem}),

    fetchProjectFileTemplate: async (projectId) => {
        console.debug("hello world")
    },

    // fetch project files
    // TODO this is temporarily hacked together to return a list of templates associated to the project
    fetchProjectFileSystem: async (projectId) => {
        let children = []
        if (projectId) {
            const templates = await get().fetchTemplates(projectId)
            if (templates) {
                children = [
                    tempFunc("basic", "Basic", templates),
                    tempFunc("mako", "Mako", templates),
                    tempFunc("python", "Python", templates),
                    tempFunc("golang", "Go", templates),
                    tempFunc("sql", "SQL", templates)
                ]
            }
        }

        // TODO temporary hack until we build a remote file system api for projects
        const fs = [
            {
                id: 'src',
                label: 'src',
                icon: Folder,
                type: 'folder',
                children: children
            },
            { id: 'README.md', label: 'README.md', icon: FileText, type: 'file' }
        ]
        get().setProjectFileSystem(fs)
    },
})

export default createFileSystemSlice


import {Directory, FileTemplate, InstructionTemplate} from "../model";

export const useFileSystemSlice = (set, get) => ({
    projectFiles: [],
    selectedFile: null,

    setProjectFiles: (projectFiles) => set({projectFiles: projectFiles}),
    setSelectedFile: (selectedFile) => set({selectedFile: selectedFile}),

    setSelectedFileContent: (content) => {
        if (!get().selectedFile) {
            return
        }
        get().selectedFile.content = content
    },
    saveSelectedFile: async() => {
        const file = get().selectedFile
        return get().saveFile(file)
    },
    saveFile: async(file) => {
        if (!file) {
            console.error('unable to save incomplete and or undefined file')
            return
        }

        const projectId = get().selectedProjectId
        if (file instanceof FileTemplate) {
            let template = new InstructionTemplate(projectId, file)
            template = await get().saveTemplate(template)
            console.debug(`saved instruction template ${template}`)

            // add the newly created template, need to refresh the file tree
            const files = await get().buildFileTemplates(get().templates)
            await get().buildAndSetProjectFileStructure(files)
        } else {
            throw new Error("invalid file type")
        }
    },
    renameSelectedFile: async(new_name) => {
        const file = get().selectedFile
        if (!file) {
            console.error('unable to save incomplete and or undefined file')
            return
        }

        const projectId = get().selectedProjectId
        if (file instanceof FileTemplate) {
            let template = new InstructionTemplate(projectId, file)
            template = await get().renameTemplate(template, new_name)
            console.debug(`renamed instruction template ${template}`)

            // add the newly created template, need to refresh the file tree
            const files = await get().buildFileTemplates(get().templates)
            await get().buildAndSetProjectFileStructure(files)
        } else {
            throw new Error("invalid file type")
        }
    },
    buildFileTemplateStructure: (name, label, templates) => {
        if (!templates) return []
        const filtered = templates.filter(t => t.template_type === name)
        if (!filtered) return []

        const children = filtered.map(t => new FileTemplate(t));
        return new Directory(name, name, children)
    },
    fetchAndBuildFileTemplates: async() => {
        const projectId = get().selectedProjectId
        if (!projectId) return null   // return immediate empty files if no project is selected
        const templates = await get().fetchTemplates(projectId)
        return await get().buildFileTemplates(templates)
    },
    buildFileTemplates: async () => {
        let children = []
        const bfs = get().buildFileTemplateStructure
        const templates = get().templates
        if (templates) {
            children = [
                bfs("basic", "Basic", templates),
                bfs("mako", "Mako", templates),
                bfs("python", "Python", templates),
                bfs("golang", "Go", templates),
                bfs("sql", "SQL", templates),
                bfs("lua", "Lua", templates)
            ]
        }
        return children
    },

    // createProjectFile: (name, type) => {
    //     const templateFile = new InstructionTemplate(
    //         get().selectedProjectId,
    //         new FileTemplate({
    //                 id: null,
    //                 name: name,
    //                 content: ""
    //             }
    //         )
    //     )
    //
    //
    //     const file = {
    //         template_id: null,
    //         template_content: "<blank>",
    //         template_type: type,
    //         template_path: name
    //
    //     }
    //     get().projectFiles.push(file)
    // },

    // fetch project files
    // TODO this is temporarily hacked together to return a list of templates associated to the project
    fetchProjectFiles: async () => {
        const files = await get().fetchAndBuildFileTemplates()
        return get().buildAndSetProjectFileStructure(files)
    },
    buildAndSetProjectFileStructure: async (files) => {
        const root = new Directory(
            "src",
            "src",
            files
        )
        // { id: 'README.md', label: 'README.md', icon: FileText, type: 'file' }

        const fs = [root]
        get().setProjectFiles(fs)
    }
})

export default useFileSystemSlice


import {FileTemplate, Directory} from "../model/file";
import {InstructionTemplate} from "../model/template";

export const createFileSystemSlice = (set, get) => ({
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
    saveFile: async() => {
        const file = get().selectedFile
        if (!file) {
            console.error('unable to save incomplete and or undefined file')
            return
        }

        const projectId = get().selectedProjectId
        if (file instanceof FileTemplate) {
            const template = new InstructionTemplate(projectId, file)
            await get().saveTemplate(template)
            console.debug("saving instruction template")
        } else {
            throw new Error("invalid file type")
        }
    },


    buildFileStructure: (name, label, templates) => {
        const filtered = templates.filter(t => t.template_type === name)
        if (!filtered) {
            return []
        }

        const children = filtered.map(t => new FileTemplate(t));
        return new Directory(name, name, children)
    },

    buildFileTemplates: async () => {
        let children = []
        const projectId = get().selectedProjectId
        const bfs = get().buildFileStructure
        const templates = await get().fetchTemplates(projectId)
        if (templates) {
            children = [
                bfs("basic", "Basic", templates),
                bfs("mako", "Mako", templates),
                bfs("python", "Python", templates),
                bfs("golang", "Go", templates),
                bfs("sql", "SQL", templates)
            ]
        }
        return children
    },

    createProjectFile: (name, type) => {
        new InstructionTemplate(
            get().selectedProjectId,
            new FileTemplate({
                    id: null,
                    name: name,
                    content: "start here"
                }
            )
        )
        const file = {
            template_id: null,
            template_content: "<blank>",
            template_type: type,
            template_path: name

        }
        get().projectFiles.push(file)
    },

    // fetch project files
    // TODO this is temporarily hacked together to return a list of templates associated to the project
    fetchProjectFiles: async () => {
        const files = await get().buildFileTemplates()
        const root = new Directory(
            "src",
            "src",
            files
        )
        // { id: 'README.md', label: 'README.md', icon: FileText, type: 'file' }

        const fs = [root]
        get().setProjectFiles(fs)
    },
})

export default createFileSystemSlice


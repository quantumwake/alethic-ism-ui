import BaseFile from "./base";

export class FileTemplate extends BaseFile {
    format!: string;

    constructor(template: any) {
        super(
            template?.template_id,
            template.template_path,
            template?.template_content,
        )
        this.format = template.template_type
    }

    async load() {
        // const { templates } = useStore()
        // const template = templates.find((t: {
        //     template_id: string;
        // }) => t.template_id === this.id);
        // return template?.template_content || '';
        return this.content || '';
    }

    async save(content: string) {
        console.debug(this.id)
        // const { updateTemplate } = useTemplateStore.getState();
        // await updateTemplate(this.id, content);
    }
}

export default FileTemplate
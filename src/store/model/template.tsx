import {FileTemplate} from "@/store/model/file";

export class InstructionTemplate {
    template_id!: string
    template_path!: string
    template_content!: string
    template_type!: string
    project_id!: string

    constructor(project_id: string, file: FileTemplate) {
        this.template_id = file.id
        this.template_path = file.name
        this.template_content = file.content
        this.template_type = file.format
        this.project_id = project_id
    }
}

export default InstructionTemplate
import {useStore} from "../index";

interface IFile {
    id: string;
    name: string;
    // path: string;
    // content: string;
    type: 'file' | 'directory';
    load(): Promise<string>;
    save(content: string): Promise<void>;
}

abstract class BaseIFile implements IFile {
    id!: string;
    name!: string;
    type!: 'file' | 'directory';

    protected constructor(id: string, name: string, type: 'file' | 'directory') {
        this.id = id
        this.name = name
        this.type = type
    }

    abstract load(): Promise<string>;
    abstract save(content: string): Promise<void>;
}

abstract class BaseFile extends BaseIFile {
    content!: string;

    protected constructor(id: string, name: string, content: string ) {
        super(id, name, "file")
        this.content = content
    }

    abstract load(): Promise<string>;
    abstract save(content: string): Promise<void>;
}

export class Directory extends BaseIFile {
    children!: IFile[];

    constructor(id: string, name: string, children: IFile[]) {
        super(id, name, "directory")
        this.children = children
    }

    load(): Promise<string> {
        return Promise.resolve("");
    }

    save(content: string): Promise<void> {
        return Promise.resolve(undefined);
    }


}

export class FileTemplate extends BaseFile {
    format!: string;

    constructor(template: any) {
        super(
            template.template_id,
            template.template_path,
            template.template_content,
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

// export default FileTemplate
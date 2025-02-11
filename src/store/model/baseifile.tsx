import IFile from "./ifile";

export abstract class BaseIFile implements IFile {
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

export default BaseIFile
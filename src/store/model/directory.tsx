import IFile from "./ifile";
import BaseIFile from "./baseifile";

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

export default Directory
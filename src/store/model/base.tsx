import IFile from "./ifile";
import BaseIFile from "./baseifile";

abstract class BaseFile extends BaseIFile {
    content!: string;

    protected constructor(id: string, name: string, content: string ) {
        super(id, name, "file")
        this.content = content
    }

    abstract load(): Promise<string>;
    abstract save(content: string): Promise<void>;
}

export default BaseFile
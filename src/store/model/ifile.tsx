export interface IFile {
    id: string;
    name: string;
    // path: string;
    // content: string;
    type: 'file' | 'directory';
    load(): Promise<string>;
    save(content: string): Promise<void>;
}

export default IFile
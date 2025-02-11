import React, { memo, useState } from "react";
import {TerminalDialog, TerminalButton, TerminalFileUpload, TerminalLabel, TerminalInput} from "../common";
import {useStore} from "../../store";
import {TerminalDropdown} from "../common";
import {FileTemplate} from "../../store/model";

function TerminalNewFileDialog({ isOpen, setIsOpen }) {
    const theme = useStore(state => state.getCurrentTheme());
    const {saveFile} = useStore()
    const [fileType, setFileType] = useState("mako")
    const [fileName, setFileName] = useState()
    const [fileTypes] = useState([
        { id: "basic", label: "Basic Template" },
        { id: "mako", label: "Mako Template" },
        { id: "python", label: "Python" },
        { id: "sql", label: "SQL" },
        { id: "ismql", label: "ISM-QL" },
    ]);


    // const { uploadState } = useStore();

    const handleClose = () => {
        setIsOpen(false);
        // setSelectedFile(null);
    };

    const handleCreate = async() => {
        const file = new FileTemplate(
            {
                template_path: fileName,
                template_type: fileType,
                template_content: ""
            }
        )
        const result = await saveFile(file)
        console.debug(`created new file: ${result})`)
    }

    return (
        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="NEW FILE">
            <div className="space-y-4">
                <TerminalLabel description="name of file">Type</TerminalLabel>
                <TerminalDropdown
                    values={fileTypes}
                    onSelect={(data) =>  setFileType(data.id)}
                    defaultValue="mako"
                    placeholder="Select file type to create..."
                >
                </TerminalDropdown>

                <TerminalLabel description="name of file">Name</TerminalLabel>
                <TerminalInput name="name"
                               value={fileName}
                               onChange={(o) => setFileName(o.target.value)}
                               placeholder="Enter file name..."
                >
                </TerminalInput>

                {/*<TerminalFileUpload onChange={handleFileChange} accept=".csv" icon={<Upload className={`w-4 h-4 ${theme.icon}`} />} />*/}
                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={handleClose}>Discard</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleCreate}>Create</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalNewFileDialog);
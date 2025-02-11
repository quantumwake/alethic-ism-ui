import React, { memo, useState } from "react";
import {TerminalDialog, TerminalButton, TerminalLabel, TerminalInput} from "../common";
import {useStore} from "../../store";
import {TerminalDropdown} from "../common";

function TerminalFileRenameDialog({ isOpen, setIsOpen }) {
    const theme = useStore(state => state.getCurrentTheme());
    const {renameSelectedFile, selectedFile} = useStore()
    const [fileName, setFileName] = useState(selectedFile?.name)

    const handleRename = async() => {
        // const file = new FileTemplate(
        //     {
        //         template_path: fileName,
        //         template_type: fileType,
        //         template_content: ""
        //     }
        // )
        const result = await renameSelectedFile(fileName)
        console.debug(`created new file: ${selectedFile})`)
    }

    const handleClose = async() => {
        setIsOpen(false)
    }

    return (
        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="RENAME FILE">
            <div className="space-y-4">
                <TerminalLabel>Current Filename</TerminalLabel>
                <TerminalInput disabled={true} value={selectedFile?.name}></TerminalInput>
                <TerminalLabel>Rename To</TerminalLabel>
                <TerminalInput name="name"
                               value={fileName}
                               onChange={(o) => setFileName(o.target.value)}
                               placeholder="Enter new file name..."
                >
                </TerminalInput>

                {/*<TerminalFileUpload onChange={handleFileChange} accept=".csv" icon={<Upload className={`w-4 h-4 ${theme.icon}`} />} />*/}
                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={handleClose}>Discard</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleRename}>Rename</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalFileRenameDialog);
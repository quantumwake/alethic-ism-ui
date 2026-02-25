import React, { memo, useState, useEffect } from "react";
import {TerminalDialog, TerminalButton, TerminalLabel, TerminalInput} from "../common";
import {useStore} from "../../store";

function TerminalFileRenameDialog({ isOpen, setIsOpen }) {
    const theme = useStore(state => state.getCurrentTheme());
    const {renameSelectedFile, selectedFile} = useStore()
    const [fileName, setFileName] = useState('')

    useEffect(() => {
        if (isOpen && selectedFile?.name) {
            setFileName(selectedFile.name)
        }
    }, [isOpen, selectedFile]);

    const handleRename = async() => {
        const result = await renameSelectedFile(fileName)
        console.debug(`renamed file: ${fileName}`)
        setIsOpen(false)
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

                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={handleClose}>Discard</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleRename}>Rename</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalFileRenameDialog);

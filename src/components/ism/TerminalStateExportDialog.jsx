import React, {memo, useEffect, useState} from "react";
import {TerminalDialog, TerminalButton, TerminalLabel, TerminalInput} from "../common";
import {useStore} from "../../store";
import {TerminalDropdown} from "../common";

function TerminalStateExportDialog({ isOpen, setIsOpen, stateId }) {
    // const theme = useStore(state => state.getCurrentTheme());
    const {exportStateData} = useStore()
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        if (isOpen) {
            // export filename as export_{date}.xlsx
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0];
            const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-');
            setFileName(`export_${formattedDate}_${formattedTime}.xlsx`);
        }
    }, [isOpen]);

    const handleExport = async() => {
        await exportStateData(stateId, fileName)

    //     // const file = new FileTemplate(
    //     //     {
    //     //         template_path: fileName,
    //     //         template_type: fileType,
    //     //         template_content: ""
    //     //     }
    //     // )
    //     const result = await renameSelectedFile(fileName)
    //     console.debug(`created new file: ${selectedFile})`)
    }

    const handleClose = async() => {
        setIsOpen(false)
    }

    return (
        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="export name">
            <div className="space-y-4">
                <TerminalLabel>Export filename</TerminalLabel>
                <TerminalInput name="name"  value={fileName}
                               onChange={(o) => setFileName(o.target.value)}
                               placeholder="Enter new file name...">
                </TerminalInput>

                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={handleClose}>Discard</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleExport}>Export</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalStateExportDialog);
import React, { memo, useState } from "react";
import {TerminalDialog, TerminalButton, TerminalLabel, TerminalInput} from "../common";
import {useStore} from "../../store";

function TerminalStateImportHgDialog({ isOpen, setIsOpen, stateId }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const theme = useStore(state => state.getCurrentTheme());
    const { importHgDataset } = useStore();

    const [dsPath, setDsPath] = useState("")
    const [dsRevision, setDsRevision] = useState(null)
    const [dsSplit, setDsSplit] = useState("train")
    const [dsSubset, setDsSubset] = useState(null)

    const handleClose = () => {
        setIsOpen(false);
    };

    // const handleFileChange = (files) => { setSelectedFile(files) }

    const handleImport = async () => {
        // if (selectedFile) {
        //     await uploadState(nodeId, selectedFile);
        // }
        await importHgDataset(stateId, dsPath, dsRevision, dsSplit, dsSubset)
        // handleClose();
    };

    return (
        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="Upload State Data">
            <div className="space-y-4">
                <TerminalLabel>Path</TerminalLabel>
                <TerminalInput name="path" value={dsPath} onChange={(o) => setDsPath(o.target.value)} placeholder="Enter hugging face dataset path..."></TerminalInput>

                <TerminalLabel>Revision</TerminalLabel>
                <TerminalInput name="revision"  value={dsRevision} onChange={(o) => setDsRevision(o.target.value)} placeholder="Enter dataset revision (optional)"></TerminalInput>

                <TerminalLabel>Subset</TerminalLabel>
                <TerminalInput name="subset"  value={dsSubset} onChange={(o) => setDsSubset(o.target.value)} placeholder="Enter subset data name (optional)"></TerminalInput>

                <TerminalLabel>Split</TerminalLabel>
                <TerminalInput name="split"  value={dsSplit} onChange={(o) => setDsSplit(o.target.value)} placeholder="Enter split name (optional, default: train)"></TerminalInput>

                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={handleClose}>Discard</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleImport}>Import</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalStateImportHgDialog);
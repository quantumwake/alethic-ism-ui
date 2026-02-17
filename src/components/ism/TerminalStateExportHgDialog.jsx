import React, { memo, useState } from "react";
import {TerminalDialog, TerminalButton, TerminalLabel, TerminalInput, TerminalCheckbox} from "../common";
import {useStore} from "../../store";

function TerminalStateExportHgDialog({ isOpen, setIsOpen, stateId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const { exportHgDataset } = useStore();

    const [namespace, setNamespace] = useState("")
    const [datasetName, setDatasetName] = useState("")
    const [isPrivate, setIsPrivate] = useState(true)
    const [commitMessage, setCommitMessage] = useState("")
    const [revision, setRevision] = useState("")

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleExport = async () => {
        await exportHgDataset(
            stateId,
            namespace,
            datasetName || null,
            isPrivate,
            commitMessage || null,
            revision || null
        )
        handleClose();
    };

    return (
        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="Export to Hugging Face">
            <div className="space-y-4">
                <TerminalLabel>Namespace</TerminalLabel>
                <TerminalInput
                    name="namespace"
                    value={namespace}
                    onChange={(o) => setNamespace(o.target.value)}
                    placeholder="Enter hugging face namespace/username...">
                </TerminalInput>

                <TerminalLabel>Dataset Name</TerminalLabel>
                <TerminalInput
                    name="datasetName"
                    value={datasetName}
                    onChange={(o) => setDatasetName(o.target.value)}
                    placeholder="Enter dataset name (optional, defaults to state name)">
                </TerminalInput>

                <TerminalLabel>Commit Message</TerminalLabel>
                <TerminalInput
                    name="commitMessage"
                    value={commitMessage}
                    onChange={(o) => setCommitMessage(o.target.value)}
                    placeholder="Enter commit message (optional)">
                </TerminalInput>

                <TerminalLabel>Revision/Branch</TerminalLabel>
                <TerminalInput
                    name="revision"
                    value={revision}
                    onChange={(o) => setRevision(o.target.value)}
                    placeholder="Enter branch name (optional, defaults to main)">
                </TerminalInput>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="isPrivate" className={theme.text}>Private dataset</label>
                </div>

                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={handleClose}>Cancel</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleExport} disabled={!namespace}>Export</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalStateExportHgDialog);
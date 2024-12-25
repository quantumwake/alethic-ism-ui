import React, { memo, useState } from "react";
import {TerminalDialog, TerminalButton, TerminalFileUpload} from "../common";
import {useStore} from "../../store";
import { Upload, X } from 'lucide-react';

function TerminalStateUploadDialog({ isOpen, setIsOpen, nodeId }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const theme = useStore(state => state.getCurrentTheme());
    const { uploadState } = useStore();

    const handleClose = () => {
        setIsOpen(false);
        setSelectedFile(null);
    };

    const handleFileChange = (files) => { setSelectedFile(files) }

    const handleUpload = async () => {
        if (selectedFile) {
            await uploadState(nodeId, selectedFile);
        }
        handleClose();
    };

    return (
        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="Upload State Data">
            <div className="space-y-4">
                <TerminalFileUpload onChange={handleFileChange} accept=".csv" icon={<Upload className={`w-4 h-4 ${theme.icon}`} />} />
                <div className="flex justify-end gap-2">
                    <TerminalButton variant="warning" onClick={handleClose}>Primary</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleUpload}>Primary</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalStateUploadDialog);
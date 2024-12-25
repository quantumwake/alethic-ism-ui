import React from 'react';
import TerminalDialog from './TerminalDialog';
import {TerminalButton} from "./TerminalButton";
import {DeleteIcon, SaveIcon} from "lucide-react";
import {StopIcon} from "@heroicons/react/24/outline";
import {useStore} from '../../store';

export const TerminalDialogConfirmation = ({
                                       isOpen,
                                       onClose,
                                       title,
                                       content,
                                       onCancel,
                                       onAccept
                                   }) => {

    const theme = useStore(state => state.getCurrentTheme());

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onClose();
    };

    const handleAccept = () => {
        if (onAccept) {
            onAccept();
        }
        onClose();
    };

    return (
        <TerminalDialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col space-y-4">
                <div className={`break-words ${theme.text}`}>{content}</div>
                <div className="flex justify-end space-x-2">
                    <TerminalButton variant="secondary" onClick={handleCancel} icon={<StopIcon className="w-4 h-4"/>} children={<span>Discard</span>}/>
                    <TerminalButton variant="secondary" onClick={handleAccept} icon={<DeleteIcon className="w-4 h-4"/>} children={<span>Confirm</span>}/>
                </div>
            </div>
        </TerminalDialog>
    );
};

export default TerminalDialogConfirmation;
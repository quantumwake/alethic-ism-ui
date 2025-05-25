import {useStore} from "../../store";
import React, {memo, useEffect, useRef, useState} from "react";
import {
    TerminalDialog,
    TerminalDataTable2,
    TerminalLabel,
    TerminalDropdown,
    TerminalInput,
    TerminalButton
} from "../common";
import {BellIcon} from "lucide-react";

function TerminalErrorsDialog({ isOpen, setIsOpen}) {
    // const theme = useStore(state => state.getCurrentTheme());
    const { errors, clearErrors } = useStore();

    const handleClose = () => {
        setIsOpen(false)
    };

    return (

        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="NEW FILE">
            <div className="space-y-4">
                {errors.length > 0 && errors.map((error, index) =>
                    (
                        <div>{error.message}</div>
                    )
                )}


                {/*<TerminalFileUpload onChange={handleFileChange} accept=".csv" icon={<Upload className={`w-4 h-4 ${theme.icon}`} />} />*/}
                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={clearErrors}>Clear</TerminalButton>
                    <TerminalButton variant="primary" onClick={handleClose}>Close</TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    )
}

export default memo(TerminalErrorsDialog);
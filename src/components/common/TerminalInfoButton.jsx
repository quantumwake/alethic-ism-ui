import React, { useState } from 'react';
import { Info, Clipboard } from 'lucide-react';
import {useStore} from '../../store';

const TerminalInfoButton = ({ id, details }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [showTooltip, setShowTooltip] = useState(false);

    const toggleTooltip = () => setShowTooltip(!showTooltip);

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    const CopyItem = ({ label, value }) => (
        <div className={`flex items-center ${theme.text}`}>
            {label}: {value}
            <button onClick={() => copyToClipboard(value)} className={`ml-2 p-1 rounded ${theme.button.secondary}`}>
                <Clipboard className={`w-4 h-4 ${theme.icon}`} />
            </button>
        </div>
    );

    return (
        <div className="relative">
            <button  className={`p-0.5 rounded ${theme.button.secondary}`} onClick={toggleTooltip}>
                <Info className={`w-4 h-4`} />
            </button>
            {showTooltip && (
                <div className={`absolute left-8 mt-2 w-96 ${theme.bg} border ${theme.border} shadow-md p-2`}>
                    <CopyItem label="ID" value={id} />
                    <CopyItem label="Details" value={details} className="mt-1" />
                </div>
            )}
        </div>
    );
};

export default TerminalInfoButton;
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Info, Clipboard } from 'lucide-react';
import { useStore } from '../../store';

const TerminalInfoButton = ({ id, details, className, icon }) => {
    const theme = useStore((state) => state.getCurrentTheme());
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipStyles, setTooltipStyles] = useState({});
    const buttonRef = useRef(null);

    const toggleTooltip = () => setShowTooltip((prev) => !prev);

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    // CopyItem remains the same
    const CopyItem = ({ label, value, className = '' }) => (
        <div className={`flex items-center ${theme.text} ${className}`}>
            {label}: {value}
            <button onClick={() => copyToClipboard(value)} className={`ml-2 p-1 rounded ${theme.button.secondary}`}>
                <Clipboard className={`w-4 h-4 ${theme.icon}`} />
            </button>
        </div>
    );

    // When tooltip is shown, compute its position relative to the button.
    useEffect(() => {
        if (showTooltip && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Adjust these offsets as needed; they mimic your Tailwind spacing (e.g., left-8 and mt-2)
            const offset = { top: 8, left: 32 }; // top and left offsets in pixels
            setTooltipStyles({
                position: 'fixed',
                top: rect.bottom + offset.top,
                left: rect.left + offset.left,
                zIndex: 9999, // very high to ensure it's on top
            });
        }
    }, [showTooltip]);

    // The tooltip element that will be portaled
    const tooltipElement = (
        <div style={tooltipStyles} className={`${theme.bg} border ${theme.border} shadow-md p-2 w-96`}>
            <CopyItem label="ID" value={id} />
            <CopyItem label="Details" value={details} className="mt-1" />
        </div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                className={`${className} rounded ${theme.button.secondary}`}
                onClick={toggleTooltip}
            >
                {!icon && (
                    <Info className="w-3 h-3" />
                )}
                {icon}
            </button>
            {showTooltip && ReactDOM.createPortal(tooltipElement, document.body)}
        </>
    );
};

export default TerminalInfoButton;

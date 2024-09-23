import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function BaseNode({ nodeId, data, renderHeader, renderContent, renderControls, onExecute, theme }) {
    const handleStyle = {
        width: '12px',
        height: '12px',
        background: 'transparent',
        border: 'none',
    };

    const renderHandle = (id, type, position, className, icon) => (
        <Handle
            id={id}
            type={type}
            position={position}
            className={`${className} relative`}
        >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <FontAwesomeIcon icon={icon} className="w-2 h-2 text-blue-300" />
            </div>
        </Handle>
    );

    return (
        <div className={`text-xs ${theme?.height || 'min-h-28'} ${theme?.width || 'w-48'} bg-gray-100 text-gray-800 shadow-lg whitespace-pre-wrap rounded-2xl border-2`}>
            <div className={`flex p-1.5 items-center justify-between 
                ${theme?.headerBackground} 
                ${theme?.headerColor} 
                hover:${theme?.headerHoverBackground}`}>

                <div className="flex">
                    {renderHeader()}
                </div>

                <div className="flex">
                    {renderControls()}
                </div>
            </div>
            {renderContent()}

            <Handle id="target-1" type="target" position={Position.Top}
                    className="border-red-300 w-full h-0.5 bg-red-50 border-none rounded-none">
            </Handle>

            <Handle id="target-2" type="target" position={Position.Left}
                    className="border-red-300 w-0.5 h-full bg-red-50 border-none rounded-none">
            </Handle>

            <Handle id="target-3" type="target" position={Position.Right}
                    className="border-red-300 w-0.5 h-full bg-red-50 border-none rounded-none">
            </Handle>

            <Handle id="target-4" type="target" position={Position.Bottom}
                    className="border-red-300 w-full h-0.5 bg-red-50 border-none rounded-none">
            </Handle>
        </div>
    );
}

export default memo(BaseNode);
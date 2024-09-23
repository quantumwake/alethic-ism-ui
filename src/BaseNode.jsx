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
        <div className={`text-xs ${theme?.height || 'min-h-28'} ${theme?.width || 'w-48'} bg-gray-100 text-gray-800 shadow-lg whitespace-pre-wrap rounded-none border-2`}>
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
                    className="-top-3.5 mr-3.5 border-red-300 w-3.5 h-3.5 bg-red-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowDown} className="w-2 h-2 text-red-300"/>
                </div>
            </Handle>

            <Handle id="source-1" type="source" position={Position.Top}
                    className="-top-3.5 ml-3.5 border-blue-300 w-3.5 h-3.5 bg-blue-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowUp} className="w-2 h-2 text-blue-300"/>
                </div>
            </Handle>

            <Handle id="target-2" type="target" position={Position.Left}
                    className="-left-3.5 mb-3.5 border-red-300 w-3.5 h-3.5 bg-red-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowRight} className="w-2 h-2 text-red-300"/>
                </div>
            </Handle>

            <Handle id="source-2" type="source" position={Position.Left}
                    className="-left-3.5 mt-3.5 border-blue-300 w-3.5 h-3.5 bg-blue-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowLeft} className="w-2 h-2 text-blue-300"/>
                </div>
            </Handle>

            <Handle id="target-3" type="target" position={Position.Right}
                    className="-right-3.5 mt-3.5 border-red-300 w-3.5 h-3.5 bg-red-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowLeft} className="w-2 h-2 text-red-300"/>
                </div>
            </Handle>

            <Handle id="source-3" type="source" position={Position.Right}
                    className="-right-3.5 mb-3.5 border-blue-300 w-3.5 h-3.5 bg-blue-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowRight} className="w-2 h-2 text-blue-300"/>
                </div>
            </Handle>

            <Handle id="target-4" type="target" position={Position.Bottom}
                    className="-bottom-3.5 ml-3.5 border-red-300 w-3.5 h-3.5 bg-red-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowUp} className="w-2 h-2 text-red-300"/>
                </div>
            </Handle>

            <Handle id="source-4" type="source" position={Position.Bottom}
                    className="-bottom-3.5 mr-3.5 border-blue-300 w-3.5 h-3.5 bg-blue-100 bg-none border-1.5 rounded-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FontAwesomeIcon icon={faArrowDown} className="w-2 h-2 text-blue-300"/>
                </div>
            </Handle>
        </div>
    );
}

export default memo(BaseNode);
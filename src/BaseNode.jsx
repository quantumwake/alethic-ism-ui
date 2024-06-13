import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function BaseNode({ nodeId, data, renderHeader, renderContent, renderControls, onExecute, theme }) {
    return (
        <div className={`text-xs ${theme?.height || 'min-h-28'} ${theme?.width || 'w-48'} bg-gray-100 text-gray-800 shadow-lg whitespace-pre-wrap rounded-sm border-2`}>
            <div className="flex flex-col">
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

            </div>


            <Handle id="target-1" type="target" position={Position.Top} className="w-2 rounded-none" />
            <Handle id="target-2" type="target" position={Position.Left} className="w-2 rounded-none" />
            <Handle id="source-1" type="source" position={Position.Bottom} className="w-2 rounded-none" />
            <Handle id="source-2" type="source" position={Position.Right} className="w-2 rounded-none" />
        </div>
    );
}

export default memo(BaseNode);
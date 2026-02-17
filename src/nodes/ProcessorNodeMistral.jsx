import React, { memo } from 'react';
import {Handle, Position} from "@xyflow/react";

const options = [
    {
        label: 'gpt-4-0125-preview',
        value: 'gpt-4-0125-preview',
    },
    {
        label: 'gpt-4-1106-preview',
        value: 'gpt-4-1106-preview',
    },
    {
        label: 'gpt-3.5-turbo-0125',
        value: 'gpt-3.5-turbo-0125',
    },
];


function ProcessorNodeMistral({ id, data }) {
    return (
        <div className="text-xs w-48 bg-midnight-surface text-midnight-text-body shadow-midnight-glow-sm rounded-sm border-2 border-midnight-border">
            <div className="flex-auto">
                <div className="p-1.5 bg-midnight-info text-white font-bold">Processor (Mistral)</div>
                <div className="p-1.5 text-midnight-text-secondary font-light">{data.label}</div>
            </div>

            <Handle id="target-1" type="target" position={Position.Top} className="w-2 rounded-none"/>
            <Handle id="target-2" type="target" position={Position.Left} className="w-2 rounded-none"/>

            <Handle id="source-1" type="source" position={Position.Bottom} className="w-2 rounded-none"/>
            <Handle id="source-2" type="source" position={Position.Right} className="w-2 rounded-none"/>

        </div>
    );
}

export default memo(ProcessorNodeMistral);

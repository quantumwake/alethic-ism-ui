import React, { memo } from 'react';
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow';

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


function ProcessorNodeLlama({ id, data }) {
    return (
        <div className="text-xs min-h-20 w-60 bg-gray-100 text-white shadow-lg rounded-sm border-2">
            <div className="flex-auto">
                <div className="h-10 text-left pt-3 pl-1.5 bg-stone-500 text-white font-bold">Processor (Llama)</div>
                <div className="p-1.5 text-black font-light">{data.label}</div>
            </div>

            <Handle id="target-1" type="target" position={Position.Top} className="w-2 rounded-none"/>
            <Handle id="target-2" type="target" position={Position.Left} className="w-2 rounded-none"/>

            <Handle id="source-1" type="source" position={Position.Bottom} className="w-2 rounded-none"/>
            <Handle id="source-2" type="source" position={Position.Right} className="w-2 rounded-none"/>

        </div>
    );
}

export default memo(ProcessorNodeLlama);

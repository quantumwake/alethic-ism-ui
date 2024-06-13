import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

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


function ProcessorNodeGemini({ id, data }) {

    return (
        <div className="text-xs w-48 bg-gray-100 text-white shadow-lg rounded-sm border-2">
            <div className="flex-auto">
                <div className="p-1.5 bg-violet-500 text-white font-bold">Processor (Gemini)</div>
                <div className="p-1.5 text-black font-light">{data.label}</div>
            </div>

            <Handle id="target-1" type="target" position={Position.Top} className="w-2 rounded-none"/>
            <Handle id="target-2" type="target" position={Position.Left} className="w-2 rounded-none"/>

            <Handle id="source-1" type="source" position={Position.Bottom} className="w-2 rounded-none"/>
            <Handle id="source-2" type="source" position={Position.Right} className="w-2 rounded-none"/>

            {/*<button className="bg-red-500" aria-label="Increment value"*/}
            {/*        onClick={() => dispatch({*/}
            {/*            type: 'INCREMENT',*/}
            {/*            node_id: id,*/}
            {/*            data: data*/}
            {/*        })}>*/}
            {/*            +*/}
            {/*</button>*/}
        </div>
    );
}

export default memo(ProcessorNodeGemini);

import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBrain,
    faFileAlt,
    faNetworkWired,
    faObjectGroup,
    faObjectUngroup,
    faSitemap, faImage,
} from '@fortawesome/free-solid-svg-icons';


// Define a mapping for processor types to styles and icons
const processorStyles = {
    Python: { type:"processor_python", name: "Python", color: 'text-fuchsia-400', icon: faBrain },
    OpenAI: { type:"processor_openai", name: "OpenAI (LM)", color: 'text-blue-500', icon: faBrain },
    VisualOpenAI: { type:"processor_visual_openai", name: "OpenAI (IMG)", color: 'text-blue-500', icon: faImage },
    Anthropic: { type:"processor_anthropic", name: "Anthropic", color: 'text-red-500', icon: faBrain },
    Gemini: { type:"processor_gemini", name: "Gemini", color: 'text-green-500', icon: faBrain },
    Llama: { type:"processor_llama", name: "Llama", color: 'text-yellow-500', icon: faBrain },
    Mistral: { type:"processor_mistral", name: "Mistral", color: 'text-sky-500', icon: faBrain },
    Falcon: { type:"processor_falcon", name: "Falcon", color: 'text-purple-500', icon: faBrain },
    State: { type:"state", name: "State", color: 'text-pink-500', icon: faSitemap },
    StateMerge: { type:"processor_state_coalescer", name: "Coalescer", color: 'text-indigo-500', icon: faObjectGroup },
    SplitState: { type:"processor_split_state", name: "State Split", color: 'text-red-600', icon: faObjectUngroup },
    StoreFile: { type:"processor_store_file", name: "File", color: 'text-yellow-600', icon: faFileAlt },
    InvokeAPI: { type:"processor_invoke_api", name: "Invoke API", color: 'text-pink-600', icon: faNetworkWired },
};

const ToolIcon = ({ id, onDragStart }) => {
    const { type, name, color, icon } = processorStyles[id];
    return (
        <div
            className={`flex flex-col items-center justify-center w-20 h-12 bg-gray-100 text-gray-800 shadow rounded-none m-2 cursor-pointer hover:bg-gray-200 ${color}`}
            draggable
            onDragStart={(event) => onDragStart(event, id)}
            style={{ fontSize: '0.75rem' }} // Smaller font size
        >
            <FontAwesomeIcon icon={icon} size="lg" className="mb-2" /> {/* Smaller icon size */}
            <div className="text-xs">{name}</div>
        </div>
    );
};

const Sidebar = () => {

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="mt-2 p-1 bg-stone-50 max-h-[90%] flex flex-col overflow-y-auto shadow-md shadow-stone-200">
            {Object.keys(processorStyles).map((id) => (
                <ToolIcon
                    id={id}
                    key={id}
                    onDragStart={(event) => onDragStart(event, processorStyles[id].type)}/>
            ))}
        </aside>
    );
};

export default Sidebar;

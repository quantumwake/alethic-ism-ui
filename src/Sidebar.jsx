import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useStore from "./store";
import Tippy from "@tippyjs/react";

// Define a mapping for processor types to styles and icons
// const processorStyles = {
//     Python: { type:"processor_python", name: "Python", tooltip: "execute python functions via python templates", color: 'text-fuchsia-400', icon: faBrain, enabled: true, },
//     OpenAI: { type:"processor_openai", name: "OpenAI (LM)", tooltip: "execute openai language prompts via templates", color: 'text-blue-500', icon: faBrain, enabled: true },
//     VisualOpenAI: { type:"processor_visual_openai", name: "OpenAI (IMG)", color: 'text-blue-500', icon: faImage, enabled: true },
//     Anthropic: { type:"processor_anthropic", name: "Anthropic", color: 'text-red-500', icon: faBrain, enabled: true },
//     Gemini: { type:"processor_gemini", name: "Gemini", color: 'text-green-500', icon: faBrain, enabled: false  },
//     Llama: { type:"processor_llama", name: "Llama", color: 'text-yellow-500', icon: faBrain, enabled: true },
//     Mistral: { type:"processor_mistral", name: "Mistral", color: 'text-sky-500', icon: faBrain, enabled: false },
//     Falcon: { type:"processor_falcon", name: "Falcon", color: 'text-purple-500', icon: faBrain, enabled: false  },
//     State: { type:"state", name: "State", color: 'text-pink-500', icon: faSitemap, enabled: true },
//     StateMerge: { type:"processor_state_coalescer", name: "Coalescer", color: 'text-indigo-500', icon: faObjectGroup, enabled: false  },
//     SplitState: { type:"processor_split_state", name: "State Split", color: 'text-red-600', icon: faObjectUngroup, enabled: false  },
//     StoreFile: { type:"processor_store_file", name: "File", color: 'text-yellow-600', icon: faFileAlt, enabled: false  },
//     InvokeAPI: { type:"processor_invoke_api", name: "Invoke API", color: 'text-pink-600', icon: faNetworkWired, enabled: false  },
// };

import {
    faCode, faImage, faRobot,
    faFlask, faWind, faDove, faDatabase, faObjectGroup,
    faObjectUngroup, faFile, faCloud, faFilterCircleXmark,
    faVolumeHigh, faMicrophone, faCalendarDays
} from '@fortawesome/free-solid-svg-icons';
import {faMailForward} from "@fortawesome/free-solid-svg-icons/faMailForward";

const processorStyles = {
    State: {
        type: "state",
        name: "Data Object",
        tooltip: "Input or output values attached to a function and or process",
        color: 'text-pink-500',
        icon: faDatabase,
        enabled: true
    },
    Python: {
        type: "processor_python",
        name: "Python Function",
        tooltip: "Function to execute Python code using predefined templates",
        color: 'text-fuchsia-400',
        icon: faCode,
        enabled: true,
    },
    OpenAI: {
        type: "processor_openai",
        name: "OpenAI (LM)",
        tooltip: "Function to generate text using OpenAI's language models via templates",
        color: 'text-blue-500',
        icon: faRobot,
        enabled: true
    },
    VisualOpenAI: {
        type: "processor_visual_openai",
        name: "OpenAI (Visual)",
        tooltip: "Function to process or generate images using OpenAI's visual models",
        color: 'text-blue-500',
        icon: faImage,
        enabled: true
    },
    AudioOpenAI: {
        type: "processor_audio_openai",
        name: "OpenAI (Audio)",
        tooltip: "Function to process or generate audio using OpenAI's audio models",
        color: 'text-blue-500',
        icon: faImage,
        enabled: false
    },
    Anthropic: {
        type: "processor_anthropic",
        name: "Anthropic",
        tooltip: "Function to generate text using Anthropic's language models",
        color: 'text-red-500',
        icon: faRobot,
        enabled: true
    },
    Llama: {
        type: "processor_llama",
        name: "Llama",
        tooltip: "Generate text using Meta's Llama language model",
        color: 'text-yellow-500',
        icon: faFlask,
        enabled: true
    },
    StateMerge: {
        type: "processor_state_coalescer",
        name: "Coalescer",
        tooltip: "Function to combine multiple inputs into a single coherent value used as another input into a function.",
        color: 'text-indigo-500',
        icon: faObjectGroup,
        enabled: true
    },
    Trainer: {
        type: "trainer",
        name: "Model Trainer",
        tooltip: "Basic Model Trainer",
        color: 'text-orange-500',
        icon: faDove,
        enabled: true
    },
    GoogleAI: {
        type: "processor_google_ai",
        name: "Google AI",
        tooltip: "Generate text or analyze images using Google's Gemini AI",
        color: 'text-orange-500',
        icon: faRobot,
        enabled: true
    },
    Mistral: {
        type: "processor_mistral",
        name: "Mistral",
        tooltip: "Generate text using Mistral AI's language models",
        color: 'text-sky-500',
        icon: faWind,
        enabled: false
    },
    Falcon: {
        type: "processor_falcon",
        name: "Falcon",
        tooltip: "Generate text using Technology Innovation Institute's Falcon model",
        color: 'text-purple-500',
        icon: faDove,
        enabled: false
    },
    SplitState: {
        type: "processor_split_state",
        name: "State Split",
        tooltip: "Divide a single state object into multiple separate states",
        color: 'text-red-600',
        icon: faObjectUngroup,
        enabled: false
    },
    StoreFile: {
        type: "processor_store_file",
        name: "File",
        tooltip: "Save or retrieve data from a file storage system",
        color: 'text-yellow-600',
        icon: faFile,
        enabled: false
    },
    InvokeAPI: {
        type: "processor_invoke_api",
        name: "Invoke API",
        tooltip: "Make external API calls to integrate third-party services",
        color: 'text-pink-600',
        icon: faCloud,
        enabled: false
    },
    // New functions
    DataPreprocessor: {
        type: "processor_data_preprocessor",
        name: "Data Transformer",
        tooltip: "Clean, transform, and prepare data for analysis or model input",
        color: 'text-cyan-500',
        icon: faFilterCircleXmark,
        enabled: false
    },
    TextToSpeech: {
        type: "processor_text_to_speech",
        name: "Text to Speech",
        tooltip: "Convert text into synthesized speech audio",
        color: 'text-orange-500',
        icon: faVolumeHigh,
        enabled: false
    },
    SpeechToText: {
        type: "processor_speech_to_text",
        name: "Speech to Text",
        tooltip: "Transcribe audio speech into text",
        color: 'text-lime-500',
        icon: faMicrophone,
        enabled: false
    },
    Scheduler: {
        type: "processor_scheduler",
        name: "Scheduler",
        tooltip: "Schedule and manage automated tasks or workflows",
        color: 'text-violet-500',
        icon: faCalendarDays,
        enabled: false
    },
    Notification: {
        type: "processor_notification",
        name: "Notification",
        tooltip: "Function to send notifications",
        color: 'text-violet-500',
        icon: faMailForward,
        enabled: false
    }
};

const ToolIcon = ({ id, onDragStart }) => {
    const {selectedProjectId} = useStore()

    const { type, name, tooltip, color, icon, enabled } = processorStyles[id];
    return (
        <Tippy content={tooltip}>
            <div
                draggable={enabled}
                className={`flex flex-col p-2 items-center justify-center w-22 h-20 bg-gray-100 text-gray-800 shadow rounded-none m-2 cursor-pointer hover:bg-gray-200 ${color} ${
                    (!selectedProjectId || !enabled) && "opacity-25 cursor-not-allowed"
                }`}
                onDragStart={(event) => onDragStart(event, id)}
                style={{ fontSize: '0.75rem' }}>

                <FontAwesomeIcon icon={icon} size="lg" className="mb-2" /> {/* Smaller icon size */}
                <div className="text-xs">{name}</div>
            </div>
        </Tippy>
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

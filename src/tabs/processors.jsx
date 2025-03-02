import {
    Store,
    Database,
    Code,
    Brain,
    Image,
    Volume2,
    Wind,
    Workflow,
    SplitSquareVertical,
    FileJson,
    Table,
    Binary,
    Network,
    FileText,
    Combine,
    Webhook,
    MessagesSquare,
    Mail,
    CloudLightning,
    BrainCircuit,
    Filter,
    Timer,
    Truck,
    Zap
} from 'lucide-react';

// Helper function to create processor style objects
const componentFn = (type, name, tooltip, color, icon, enabled = true) => ({
    type,
    name,
    tooltip,
    color,
    icon,
    enabled
});

export const processorStyles = {
    // Data States
    State: componentFn(
        'state',
        'Data Object',
        'Input or output data object that can be connected to processors',
        'text-blue-500',
        Store
    ),

    // Data Sources
    SQL: componentFn(
        'function_datasource_sql',
        'SQL',
        'Connect and interact with SQL or NoSQL databases',
        'text-green-500',
        Database
    ),

    JsonFile: componentFn(
        'processor_json',
        'JSON',
        'Read or write JSON data',
        'text-yellow-500',
        FileJson,
        false
    ),

    CSV: componentFn(
        'processor_csv',
        'CSV',
        'Process CSV files and tabular data',
        'text-green-400',
        Table,
        false
    ),

    TextFile: componentFn(
        'processor_text',
        'Text',
        'Handle plain text files and content',
        'text-gray-500',
        FileText,
        false
    ),

    Stream: componentFn(
        'processor_stream',
        'Stream',
        'Process streaming data in real-time',
        'text-purple-500',
        Binary,
        false,
    ),

    // Core Processors
    Python: componentFn(
        'processor_python',
        'Python',
        'Custom Python function for data processing',
        'text-indigo-500',
        Code
    ),

    Transform: componentFn(
        'processor_transform',
        'Transform',
        'Transform data between different formats and structures',
        'text-orange-500',
        Workflow,
        false
    ),

    Filter: componentFn(
        'processor_filter',
        'Filter',
        'Filter and validate data based on conditions',
        'text-red-500',
        Filter,
        false,
    ),

    Split: componentFn(
        'processor_split',
        'Split',
        'Split data into multiple streams',
        'text-yellow-600',
        SplitSquareVertical
    ),

    // Merge: componentFn(
    //     'processor_merge',
    //     'Merge',
    //     'Combine multiple data streams into one',
    //     'text-blue-600',
    //     Combine
    // ),

    // AI Models
    OpenAI: componentFn(
        'processor_openai',
        'OpenAI',
        'Process text using OpenAI models',
        'text-green-600',
        Brain
    ),

    OpenAIVision: componentFn(
        'processor_openai_vision',
        'OpenAI Vision',
        'Process images using OpenAI models',
        'text-green-600',
        Image
    ),

    OpenAIAudio: componentFn(
        'processor_openai_audio',
        'OpenAI Audio',
        'Process audio using OpenAI models',
        'text-green-600',
        Volume2,
        false
    ),

    Anthropic: componentFn(
        'processor_anthropic',
        'Anthropic',
        'Process text using Anthropic Claude',
        'text-indigo-600',
        BrainCircuit
    ),

    GoogleAI: componentFn(
        'processor_googleai',
        'Google AI',
        'Process text and images using Google AI',
        'text-blue-500',
        CloudLightning
    ),

    Mistral: componentFn(
        'processor_mistral',
        'Mistral AI',
        'Process text using Mistral models',
        'text-cyan-500',
        Wind,
        false
    ),

    // Integration Processors
    APICall: componentFn(
        'processor_api',
        'API Call',
        'Make external API requests',
        'text-purple-600',
        Webhook,
        false
    ),

    Notification: componentFn(
        'processor_notification',
        'Notification',
        'Send notifications through various channels',
        'text-blue-400',
        MessagesSquare,
        false
    ),

    Email: componentFn(
        'processor_email',
        'Email',
        'Send and process emails',
        'text-gray-600',
        Mail,
        false

    ),

    Schedule: componentFn(
        'processor_schedule',
        'Schedule',
        'Schedule and automate tasks',
        'text-orange-400',
        Timer,
        false

    ),

    Coalesce: componentFn(
        'processor_state_coalescer',
        'Merge',
        'Create a dot product of two different states, by project mapping them onto each other.',
        'text-orange-400',
        Timer,
    ),

    Composite: componentFn(
        'processor_state_composite',
        'Combine',
        'Merge two or more state events, given a composite key',
        'text-orange-400',
        Combine
    ),

    Queue: componentFn(
        'processor_queue',
        'Queue',
        'Manage message queues and async processing',
        'text-purple-400',
        Truck,
        false

    ),

    Trigger: componentFn(
        'processor_trigger',
        'Trigger',
        'Event-based process trigger',
        'text-yellow-400',
        Zap,
        false

    ),

    Network: componentFn(
        'processor_network',
        'Network',
        'Network-related operations and protocols',
        'text-blue-300',
        Network,
        false

    )
};

// Export categories for organization in the UI
export const processorCategories = {
    data: {
        name: 'State',
        items: ['State']
    },
    sources: {
        name: 'Data Sources',
        items: ['SQL', 'JsonFile', 'CSV', 'TextFile', 'Stream']
    },
    transform: {
        name: 'Transform',
        items: ['Coalesce', 'Composite']
    },
    processors: {
        name: 'Processors',
        items: ['Python', 'Filter']
    },
    ai: {
        name: 'AI Models',
        items: ['OpenAI', 'OpenAIVision', 'OpenAIAudio', 'Anthropic', 'GoogleAI', 'Mistral']
    },
    integration: {
        name: 'Integration',
        items: ['APICall', 'Notification', 'Email', 'Schedule', 'Queue', 'Trigger', 'Network']
    }
};

// Helper function to get all enabled processors
export const getEnabledProcessors = () =>
    Object.entries(processorStyles)
        .filter(([_, config]) => config.enabled)
        .reduce((acc, [key, config]) => ({ ...acc, [key]: config }), {});

// Helper function to get processors by category
export const getProcessorsByCategory = (category) =>
    processorCategories[category].items.map(key => ({
        key,
        ...processorStyles[key]
    }));
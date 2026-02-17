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
        'text-midnight-success-bright',
        Store
    ),

    // Data Sources
    SQL: componentFn(
        'function_datasource_sql',
        'SQL',
        'Connect and interact with SQL or NoSQL databases',
        'text-midnight-success',
        Database
    ),

    JsonFile: componentFn(
        'processor_json',
        'JSON',
        'Read or write JSON data',
        'text-midnight-warning',
        FileJson,
        false
    ),

    CSV: componentFn(
        'processor_csv',
        'CSV',
        'Process CSV files and tabular data',
        'text-midnight-success-bright',
        Table,
        false
    ),

    TextFile: componentFn(
        'processor_text',
        'Text',
        'Handle plain text files and content',
        'text-midnight-text-muted',
        FileText,
        false
    ),

    Stream: componentFn(
        'processor_stream',
        'Stream',
        'Process streaming data in real-time',
        'text-midnight-accent',
        Binary,
        false,
    ),

    // Core Processors
    Python: componentFn(
        'processor_python',
        'Python',
        'Custom Python function for data processing',
        'text-midnight-accent-bright',
        Code
    ),

    Transform: componentFn(
        'processor_transform',
        'Transform',
        'Transform data between different formats and structures',
        'text-midnight-warning-bright',
        Workflow,
        false
    ),

    Filter: componentFn(
        'processor_filter',
        'Filter',
        'Filter and validate data based on conditions',
        'text-midnight-danger',
        Filter,
        false,
    ),

    Split: componentFn(
        'processor_split',
        'Split',
        'Split data into multiple streams',
        'text-midnight-warning',
        SplitSquareVertical
    ),

    // Merge: componentFn(
    //     'processor_merge',
    //     'Merge',
    //     'Combine multiple data streams into one',
    //     'text-midnight-info',
    //     Combine
    // ),

    // AI Models
    OpenAI: componentFn(
        'processor_openai',
        'OpenAI',
        'Process text using OpenAI models',
        'text-midnight-success',
        Brain
    ),

    OpenAIVision: componentFn(
        'processor_openai_vision',
        'OpenAI Vision',
        'Process images using OpenAI models',
        'text-midnight-success',
        Image
    ),

    OpenAIAudio: componentFn(
        'processor_openai_audio',
        'OpenAI Audio',
        'Process audio using OpenAI models',
        'text-midnight-success',
        Volume2,
        false
    ),

    Anthropic: componentFn(
        'processor_anthropic',
        'Anthropic',
        'Process text using Anthropic Claude',
        'text-midnight-accent-bright',
        BrainCircuit
    ),

    GoogleAI: componentFn(
        'processor_googleai',
        'Google AI',
        'Process text and images using Google AI',
        'text-midnight-info',
        CloudLightning
    ),

    Mistral: componentFn(
        'processor_mistral',
        'Mistral AI',
        'Process text using Mistral models',
        'text-midnight-info-bright',
        Wind,
        false
    ),

    // Integration Processors
    APICall: componentFn(
        'processor_api',
        'API Call',
        'Make external API requests',
        'text-midnight-accent',
        Webhook,
        false
    ),

    Notification: componentFn(
        'processor_notification',
        'Notification',
        'Send notifications through various channels',
        'text-midnight-info-bright',
        MessagesSquare,
        false
    ),

    Email: componentFn(
        'processor_email',
        'Email',
        'Send and process emails',
        'text-midnight-text-secondary',
        Mail,
        false

    ),

    Schedule: componentFn(
        'processor_schedule',
        'Schedule',
        'Schedule and automate tasks',
        'text-midnight-warning-bright',
        Timer,
        false

    ),

    Coalesce: componentFn(
        'processor_state_coalescer',
        'Merge',
        'Create a dot product of two different states, by project mapping them onto each other.',
        'text-midnight-warning-bright',
        Timer,
    ),

    Composite: componentFn(
        'processor_state_composite',
        'Combine',
        'Merge two or more state events, given a composite key',
        'text-midnight-warning-bright',
        Combine
    ),

    Queue: componentFn(
        'processor_queue',
        'Queue',
        'Manage message queues and async processing',
        'text-midnight-accent',
        Truck,
        false

    ),

    Provider: componentFn(
        'processor_provider',
        'Provider',
        'Standard interface to any provider within a provider class',
        'text-midnight-accent',
        Filter,
        true
    ),

    Trigger: componentFn(
        'processor_trigger',
        'Trigger',
        'Event-based process trigger',
        'text-midnight-warning',
        Zap,
        false

    ),

    Network: componentFn(
        'processor_network',
        'Network',
        'Network-related operations and protocols',
        'text-midnight-info-bright',
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
    common: {
        name: "Common",
        items: ['Provider']
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
import React from 'react';
import {
    Workflow,
    Brain,
    Database,
    Code,
    ArrowRight,
    Zap,
    Layers,
    GitBranch,
    Plus,
    FolderOpen,
    Cpu,
    FileText,
    Cable,
} from 'lucide-react';
import { useStore } from '../store';

const HomeTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const projects = useStore(state => state.projects);
    const selectedProjectId = useStore(state => state.selectedProjectId);
    const userId = useStore(state => state.userId);
    const {
        setCurrentWorkspace,
        setSelectedProjectId,
        fetchWorkflowNodes,
        fetchWorkflowEdges,
        fetchTemplates,
        fetchProviders,
        newProject,
        saveProject,
    } = useStore();

    const onSelectProject = async (project) => {
        const projectId = project.project_id;
        fetchWorkflowNodes(projectId);
        await fetchWorkflowEdges(projectId);
        await fetchTemplates(projectId);
        await fetchProviders();
        setSelectedProjectId(projectId);
        setCurrentWorkspace('bench');
    };

    const handleNewProject = async () => {
        const project = await newProject('New Project');
        const saved = await saveProject(project);
        if (saved) {
            setCurrentWorkspace('bench');
        }
    };

    const recentProjects = (projects || []).slice(0, 5);

    return (
        <div className={`h-full overflow-y-auto ${theme.bg}`}>
            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Hero */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${theme.status.info.bg} ${theme.status.info.border} border`}>
                            <Workflow className={`w-6 h-6 ${theme.status.info.text}`} />
                        </div>
                        <h1 className={`text-2xl font-bold ${theme.textAccent}`}>
                            Instruction State Machine
                        </h1>
                    </div>
                    <p className={`text-sm ${theme.text} max-w-2xl leading-relaxed`}>
                        Build data pipelines visually by connecting <strong>states</strong>, <strong>processors</strong>,
                        and <strong>templates</strong> with <strong>edges</strong> on a canvas. Chain AI models,
                        Python code, data transforms, and integrations into automated workflows.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mb-10">
                    <button
                        onClick={() => setCurrentWorkspace('bench')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${theme.button.primary}`}
                    >
                        <Zap className="w-4 h-4" />
                        Open Bench
                    </button>
                    <button
                        onClick={handleNewProject}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${theme.button.secondary}`}
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>

                {/* Recent Projects */}
                {recentProjects.length > 0 && (
                    <div className="mb-10">
                        <h2 className={`text-xs uppercase tracking-wider ${theme.textMuted} mb-4`}>Recent Projects</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {recentProjects.map(project => (
                                <button
                                    key={project.project_id}
                                    onClick={() => onSelectProject(project)}
                                    className={`text-left p-4 rounded-lg border transition-all duration-200 ${theme.border} ${theme.hover} ${
                                        project.project_id === selectedProjectId
                                            ? `${theme.status.info.bg} ${theme.status.info.border}`
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <FolderOpen className={`w-3.5 h-3.5 ${theme.status.info.text}`} />
                                        <span className={`text-sm font-medium ${theme.textAccent}`}>
                                            {project.project_name}
                                        </span>
                                    </div>
                                    <span className={`text-xs ${theme.textMuted}`}>
                                        {new Date(project.created_date).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ISM Concepts */}
                <div className="mb-10">
                    <h2 className={`text-xs uppercase tracking-wider ${theme.textMuted} mb-4`}>Core Concepts</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className={`p-4 rounded-lg border ${theme.status.success.bg} ${theme.status.success.border}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Database className={`w-4 h-4 ${theme.status.success.text}`} />
                                <h3 className={`text-sm font-medium ${theme.status.success.text}`}>State</h3>
                            </div>
                            <p className={`text-xs ${theme.text} leading-relaxed`}>
                                Data tables that hold rows of input and output data. The data layer of your pipeline.
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg border ${theme.status.info.bg} ${theme.status.info.border}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Cpu className={`w-4 h-4 ${theme.status.info.text}`} />
                                <h3 className={`text-sm font-medium ${theme.status.info.text}`}>Processor</h3>
                            </div>
                            <p className={`text-xs ${theme.text} leading-relaxed`}>
                                Compute units — OpenAI, Anthropic, Python, SQL, and more. Reads input, produces output.
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg border border-purple-500/40 bg-purple-500/15`}>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className={`w-4 h-4 ${theme.textAccent}`} />
                                <h3 className={`text-sm font-medium ${theme.textAccent}`}>Template</h3>
                            </div>
                            <p className={`text-xs ${theme.text} leading-relaxed`}>
                                Prompts and code that tell processors what to do. Mako, Jinja2, or plain text.
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg border ${theme.status.warning.bg} ${theme.status.warning.border}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Cable className={`w-4 h-4 ${theme.status.warning.text}`} />
                                <h3 className={`text-sm font-medium ${theme.status.warning.text}`}>Edge</h3>
                            </div>
                            <p className={`text-xs ${theme.text} leading-relaxed`}>
                                Connections defining data flow direction — INPUT (state→processor) or OUTPUT (processor→state).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Example Pipelines */}
                <div className="mb-10">
                    <h2 className={`text-xs uppercase tracking-wider ${theme.textMuted} mb-4`}>Example Pipelines</h2>
                    <div className="space-y-3">
                        {/* AI Text Pipeline */}
                        <div className={`p-4 rounded-lg border ${theme.border} ${theme.hover} transition-all duration-200`}>
                            <h3 className={`text-xs font-medium ${theme.textAccent} mb-2`}>AI Text Pipeline</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                {[
                                    { icon: Database, label: 'Input Questions', color: theme.status.success.text },
                                    { icon: Brain, label: 'OpenAI Processor', color: theme.status.info.text },
                                    { icon: Database, label: 'AI Responses', color: theme.status.success.text },
                                ].map((step, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 border ${theme.border}`}>
                                            <step.icon className={`w-3.5 h-3.5 ${step.color}`} />
                                            <span className={`text-xs ${theme.text}`}>{step.label}</span>
                                        </div>
                                        {i < 2 && <ArrowRight className={`w-3.5 h-3.5 ${theme.textMuted} flex-none`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Code + AI Pipeline */}
                        <div className={`p-4 rounded-lg border ${theme.border} ${theme.hover} transition-all duration-200`}>
                            <h3 className={`text-xs font-medium ${theme.textAccent} mb-2`}>Code + AI</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                {[
                                    { icon: Database, label: 'CSV Data', color: theme.status.success.text },
                                    { icon: Code, label: 'Python Transform', color: theme.textAccent },
                                    { icon: Brain, label: 'Anthropic Enrichment', color: theme.status.info.text },
                                    { icon: Database, label: 'Results', color: theme.status.success.text },
                                ].map((step, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 border ${theme.border}`}>
                                            <step.icon className={`w-3.5 h-3.5 ${step.color}`} />
                                            <span className={`text-xs ${theme.text}`}>{step.label}</span>
                                        </div>
                                        {i < 3 && <ArrowRight className={`w-3.5 h-3.5 ${theme.textMuted} flex-none`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Multi-Model Comparison */}
                        <div className={`p-4 rounded-lg border ${theme.border} ${theme.hover} transition-all duration-200`}>
                            <h3 className={`text-xs font-medium ${theme.textAccent} mb-2`}>Multi-Model Comparison</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 border ${theme.border}`}>
                                    <Database className={`w-3.5 h-3.5 ${theme.status.success.text}`} />
                                    <span className={`text-xs ${theme.text}`}>Shared Input</span>
                                </div>
                                <ArrowRight className={`w-3.5 h-3.5 ${theme.textMuted} flex-none`} />
                                <div className="flex flex-col gap-1">
                                    {['OpenAI', 'Anthropic', 'Mistral'].map((model) => (
                                        <div key={model} className={`flex items-center gap-1.5 rounded px-2.5 py-1 border ${theme.border}`}>
                                            <Brain className={`w-3 h-3 ${theme.status.info.text}`} />
                                            <span className={`text-xs ${theme.text}`}>{model}</span>
                                        </div>
                                    ))}
                                </div>
                                <ArrowRight className={`w-3.5 h-3.5 ${theme.textMuted} flex-none`} />
                                <div className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 border ${theme.border}`}>
                                    <Database className={`w-3.5 h-3.5 ${theme.status.success.text}`} />
                                    <span className={`text-xs ${theme.text}`}>Shared Output</span>
                                </div>
                            </div>
                            <p className={`text-xs ${theme.textMuted} mt-2`}>
                                Multiple processors can share input and output states — results are distinguished by provider info.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Getting Started */}
                <div className="mb-10">
                    <h2 className={`text-xs uppercase tracking-wider ${theme.textMuted} mb-4`}>Getting Started</h2>
                    <div className={`rounded-lg border p-5 space-y-5 ${theme.border}`}>
                        {[
                            { n: '1', title: 'Create or select a project', desc: 'Use the Recent Projects above, the Projects tab, or click "New Project".' },
                            { n: '2', title: 'Build your workflow', desc: 'Use the AI assistant or drag nodes onto the Bench canvas.' },
                            { n: '3', title: 'Connect states to processors', desc: 'Create edges with INPUT direction (state→processor) and OUTPUT direction (processor→state).' },
                            { n: '4', title: 'Configure templates and settings', desc: 'Set prompts, code templates, provider, temperature, and processor properties.' },
                            { n: '5', title: 'Activate the processor', desc: 'Run the pipeline to process data through your workflow.' },
                        ].map(({ n, title, desc }) => (
                            <div key={n} className="flex gap-4 items-start">
                                <div className={`flex-none w-8 h-8 rounded-full ${theme.status.info.bg} border ${theme.status.info.border} flex items-center justify-center`}>
                                    <span className={`text-xs font-mono ${theme.status.info.text}`}>{n}</span>
                                </div>
                                <div>
                                    <h4 className={`text-sm font-medium ${theme.textAccent}`}>{title}</h4>
                                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Capabilities Grid */}
                <div className="mb-10">
                    <h2 className={`text-xs uppercase tracking-wider ${theme.textMuted} mb-4`}>Capabilities</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { icon: Brain, title: 'AI Models', desc: 'OpenAI, Anthropic Claude, Google AI, Mistral, and Llama for text, vision, and audio.', color: theme.status.success.text },
                            { icon: Code, title: 'Custom Code', desc: 'Python processors with Mako/Jinja2 templates for custom data transformation.', color: theme.textAccent },
                            { icon: Database, title: 'Data Sources', desc: 'SQL databases, CSV upload, JSON, and streaming data sources.', color: theme.status.success.text },
                            { icon: Layers, title: 'Edge Functions', desc: 'Lua scripts for validation, filtering, retry logic, and data transformation.', color: theme.status.warning.text },
                            { icon: GitBranch, title: 'Visual Workflows', desc: 'Node grouping, auto-layout, real-time status, and drag-and-drop canvas.', color: theme.status.info.text },
                        ].map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className={`p-5 rounded-lg border transition-all duration-200 ${theme.border} ${theme.hover} group`}>
                                <div className="inline-flex p-2.5 rounded-lg mb-3">
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <h3 className={`text-sm font-medium ${theme.textAccent} mb-1.5`}>{title}</h3>
                                <p className={`text-xs ${theme.textMuted} leading-relaxed`}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeTab;

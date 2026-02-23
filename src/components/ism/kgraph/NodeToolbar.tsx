import React from 'react';
import {
    Play,
    Pause,
    Trash2,
    Settings,
    Eye,
    Upload,
    Download,
    Eraser,
    CloudDownload,
    CloudUpload,
} from 'lucide-react';

export const NodeToolbar: React.FC<{
    nodeId: string;
    nodeType: string;
    actions: Record<string, (() => void) | undefined>;
    isStopped?: boolean;
}> = ({ nodeId, nodeType, actions, isStopped }) => {
    const {
        onSettings,
        onDelete,
        onView,
        onExport,
        onImport,
        onImportHg,
        onExportHg,
        onPurge,
        onPlayPause,
    } = actions;

    const isStateNode = nodeType === 'state';
    const isProcessorNode = nodeType === 'processor';

    return (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-midnight-surface/95 backdrop-blur-sm border border-midnight-border shadow-lg z-10">
            {isProcessorNode && onPlayPause && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
                    className={`p-1.5 transition-colors ${isStopped ? 'bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white' : 'bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white'}`}
                    title={isStopped ? 'Start Processor' : 'Stop Processor'}
                >
                    {isStopped ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
            )}
            {isStateNode && onView && (
                <button onClick={(e) => { e.stopPropagation(); onView(); }} className="p-1.5 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors" title="View Data">
                    <Eye className="w-3.5 h-3.5" />
                </button>
            )}
            {isStateNode && onExport && (
                <button onClick={(e) => { e.stopPropagation(); onExport(); }} className="p-1.5 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-colors" title="Export Data">
                    <Download className="w-3.5 h-3.5" />
                </button>
            )}
            {isStateNode && onImport && (
                <button onClick={(e) => { e.stopPropagation(); onImport(); }} className="p-1.5 bg-amber-900/30 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors" title="Import Data">
                    <Upload className="w-3.5 h-3.5" />
                </button>
            )}
            {isStateNode && onImportHg && (
                <button onClick={(e) => { e.stopPropagation(); onImportHg(); }} className="p-1.5 bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors" title="Import from HuggingFace">
                    <CloudDownload className="w-3.5 h-3.5" />
                </button>
            )}
            {isStateNode && onExportHg && (
                <button onClick={(e) => { e.stopPropagation(); onExportHg(); }} className="p-1.5 bg-indigo-900/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors" title="Export to HuggingFace">
                    <CloudUpload className="w-3.5 h-3.5" />
                </button>
            )}
            {isStateNode && onPurge && (
                <button onClick={(e) => { e.stopPropagation(); onPurge(); }} className="p-1.5 bg-orange-900/30 text-orange-400 hover:bg-orange-600 hover:text-white transition-colors" title="Purge Data">
                    <Eraser className="w-3.5 h-3.5" />
                </button>
            )}
            {onSettings && (
                <button onClick={(e) => { e.stopPropagation(); onSettings(); }} className="p-1.5 bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors" title="Node Settings">
                    <Settings className="w-3.5 h-3.5" />
                </button>
            )}
            {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white transition-colors" title="Delete Node">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

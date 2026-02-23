import React from 'react';
import { useKGraph } from '../../../kgraph';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, Lock, Unlock } from 'lucide-react';

export const StudioToolbar: React.FC<{
    isGridVisible: boolean;
    isLocked: boolean;
    onToggleGrid: () => void;
    onToggleLock: () => void;
}> = ({ isGridVisible, isLocked, onToggleGrid, onToggleLock }) => {
    const { fitView, zoomIn, zoomOut } = useKGraph();

    const btnClass = 'p-2 transition-all duration-200 bg-midnight-surface hover:bg-midnight-elevated border border-midnight-border hover:border-midnight-border-glow text-midnight-text-body hover:text-midnight-accent-bright';
    const activeClass = 'p-2 transition-all duration-200 bg-midnight-info/20 hover:bg-midnight-info/30 border border-midnight-info hover:border-midnight-info-bright text-midnight-info-bright';

    return (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1 p-2 bg-midnight-surface/90 backdrop-blur-sm border border-midnight-border shadow-midnight-glow-sm">
            <button onClick={() => zoomIn()} className={btnClass} title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => zoomOut()} className={btnClass} title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={() => fitView({ padding: 0.2 })} className={btnClass} title="Fit View"><Maximize2 className="w-4 h-4" /></button>
            <div className="w-px h-6 bg-midnight-border mx-1" />
            <button onClick={onToggleGrid} className={isGridVisible ? activeClass : btnClass} title="Toggle Grid"><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={onToggleLock} className={isLocked ? activeClass : btnClass} title={isLocked ? 'Unlock Canvas' : 'Lock Canvas'}>
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
        </div>
    );
};

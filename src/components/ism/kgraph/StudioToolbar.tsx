import React, { useCallback } from 'react';
import { useKGraph, useKGraphContext } from '../../../kgraph';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, Lock, Unlock, ImageDown } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';

export const StudioToolbar: React.FC<{
    isGridVisible: boolean;
    isLocked: boolean;
    onToggleGrid: () => void;
    onToggleLock: () => void;
}> = ({ isGridVisible, isLocked, onToggleGrid, onToggleLock }) => {
    const { fitView, zoomIn, zoomOut } = useKGraph();
    const { containerRef } = useKGraphContext();

    const filterOverlays = (node: HTMLElement) => {
        const cl = node.classList;
        if (!cl) return true;
        if (cl.contains('kgraph-minimap')) return false;
        if (cl.contains('kgraph-background')) return false;
        if (cl.contains('z-30') || cl.contains('z-50')) return false;
        return true;
    };

    const exportToPng = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        toPng(el, { backgroundColor: '#0e0e10', filter: filterOverlays }).then((dataUrl) => {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `graph-${Date.now()}.png`;
            a.click();
        });
    }, [containerRef]);

    const exportToSvg = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        toSvg(el, { backgroundColor: '#0e0e10', filter: filterOverlays }).then((dataUrl) => {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `graph-${Date.now()}.svg`;
            a.click();
        });
    }, [containerRef]);

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
            <div className="w-px h-6 bg-midnight-border mx-1" />
            <button onClick={exportToPng} className={btnClass} title="Export as PNG"><ImageDown className="w-4 h-4" /></button>
            <button onClick={exportToSvg} className={btnClass} title="Export as SVG">
                <span className="text-xs font-mono font-bold leading-none" style={{ fontSize: 10 }}>SVG</span>
            </button>
        </div>
    );
};

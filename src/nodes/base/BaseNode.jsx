import React, { memo } from 'react';
import { Handle, Position } from "@xyflow/react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import {useStore} from "../../store";

function BaseNode({ nodeId, data, type, renderHeader, renderContent, renderControls, onExecute }) {
    const theme = useStore(state => state.getCurrentTheme());

    const getHandleColors = (handle) => ({
        source: {
            border: theme.textAccent,
            background: theme.bg,
            icon: theme.textAccent
        },
        target: {
            border: theme.textMuted,
            background: theme.bg,
            icon: theme.textMuted
        }
    })[handle];

    const getArrowIcon = (direction) => {
        const icons = {
            up: ArrowUp,
            down: ArrowDown,
            left: ArrowLeft,
            right: ArrowRight
        };
        return icons[direction];
    };


    const renderHandle = (id, handle, position, direction) => {
        const colors = getHandleColors(handle);
        const positionClasses = {
            [Position.Top]: '',
            [Position.Bottom]: '',
            [Position.Left]: '',
            [Position.Right]: ''
        };

        let clazz = ""
        if ([Position.Left, Position.Right].includes(position)) {
            if (handle === "source") {
                clazz = "mt-1.5"
            } else {
                clazz = "-mt-2"
            }
        } else {
            if (handle === "source") {
                clazz = "ml-2"
            } else {
                clazz = "-ml-1.5"
            }
        }

        const Icon = getArrowIcon(direction);

        return (
            <Handle id={id} type={handle} position={position} className={`${positionClasses[position]} hover:scale-[4] transition-transform duration-150 
                ${clazz} border border-solid ${theme.border} w-3 h-3 rounded-2xl`}
                style={{
                    borderColor: colors.border,
                    background: colors.background
                }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Icon className={theme.icon} style={{ color: colors.icon }}/>
                </div>
            </Handle>
        );
    };

    return (
        <div className={`
            ${theme.bg} 
            ${theme.border}
            ${theme?.nodes?.[type]?.size || 'w-60 h-24'}
            border shadow-md whitespace-pre-wrap rounded-none
            text-xs
        `}>
            <div className={`
                flex items-center justify-between p-1 
                ${theme?.nodes?.[type]?.header}
            `}>
                <div className={`flex ${theme?.nodes?.[type]?.headerText}`}>
                    {renderHeader && renderHeader()}
                </div>
                <div className={`flex ${theme?.nodes?.[type]?.headerText}`}>
                    {renderControls && renderControls()}
                </div>
            </div>
            {renderContent()}
            {renderHandle('target-1', 'target', Position.Top, 'down')}
            {renderHandle('source-1', 'source', Position.Top, 'up')}
            {renderHandle('target-2', 'target', Position.Left, 'right')}
            {renderHandle('source-2', 'source', Position.Left, 'left')}
            {renderHandle('target-3', 'target', Position.Right, 'left')}
            {renderHandle('source-3', 'source', Position.Right, 'right')}
            {renderHandle('target-4', 'target', Position.Bottom, 'up')}
            {renderHandle('source-4', 'source', Position.Bottom, 'down')}
        </div>
    );
}

export default memo(BaseNode);
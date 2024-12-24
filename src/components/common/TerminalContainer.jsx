import React from 'react';
import useStore from '../../store';

// Base container that handles theme and effects
export const TerminalContainer = ({ children, className = '' }) => {
    const theme = useStore(state => state.getCurrentTheme());

    const getEffectClasses = () => {
        const classes = [];
        if (theme.effects?.enableScanlines) {
            classes.push(theme.effects.scanlineClass);
        }
        if (theme.effects?.enableCrt) {
            classes.push(theme.effects.crtClass);
        }
        return classes.join(' ');
    };

    return (
        <div className={`${theme.bg} ${theme.text} ${theme.font} ${getEffectClasses()} ${className}`}>
            {children}
        </div>
    );
};

export default TerminalContainer

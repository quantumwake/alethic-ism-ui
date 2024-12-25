import React from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import { X } from 'lucide-react';
import {useStore} from '../../store';

export const TerminalDialog = ({
                           isOpen,
                           onClose,
                           title,
                           children,
                           width = 'w-full max-w-md'
                       }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <HeadlessDialog.Panel className={`${width} ${theme.bg} ${theme.border} border shadow-lg`}>
                    {/* dialog header, title and corner X button */}
                    <div className={`flex justify-between items-center p-2 border-b ${theme.border}`}>
                        <HeadlessDialog.Title className={`text-sm font-medium ${theme.text}`}>
                            {title}
                        </HeadlessDialog.Title>
                        <button onClick={onClose} className={`p-1 rounded ${theme.hover}`}>
                            <X className={`w-4 h-4 ${theme.icon}`} />
                        </button>
                    </div>

                    {/* output body */}
                    <div className="p-4">{children}</div>
                </HeadlessDialog.Panel>
            </div>
        </HeadlessDialog>
    );
};

export default TerminalDialog
import React, {useState} from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import {useStore} from "./store";
import {TerminalButton, TerminalInput} from "./components/common";

function NewProjectDialog({ isOpen, setIsOpen,}) {
    const {userId, jwtToken} = useStore()
    const [newProjectName, setNewProjectName] = useState('');
    const {addProject} = useStore()

    const handleDiscard = () => {
        setIsOpen(false);
    };

    const handleSave = async () => {
        if (newProjectName.trim()) {
            const success = await addProject(userId, newProjectName);
            if (success) {
                setNewProjectName('');
                setIsOpen(false);
            } else {
                console.error('Error adding project');
            }
        }
    };


    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-30">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel
                        transition
                        className="w-full max-w-md transform overflow-hidden rounded-lg bg-midnight-surface border border-midnight-border p-6 text-left align-middle shadow-midnight-glow transition-all duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
                    >
                        <h3 className="text-lg font-semibold text-midnight-text-primary mb-4">
                            New Project
                        </h3>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-midnight-text-label mb-2">
                                Project Name
                            </label>
                            <TerminalInput
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="My awesome project name"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <TerminalButton
                                variant="secondary"
                                onClick={handleDiscard}
                            >
                                Discard
                            </TerminalButton>
                            <TerminalButton
                                variant="primary"
                                onClick={handleSave}
                                disabled={!newProjectName.trim()}
                            >
                                Save
                            </TerminalButton>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default NewProjectDialog;

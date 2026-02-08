import React, {useState} from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import {useStore} from "./store";

function NewProjectDialog({ isOpen, setIsOpen,}) {
    const {userId, jwtToken} = useStore()
    const [newProjectName, setNewProjectName] = useState('');
    const {addProject} = useStore()

    const handleDiscard = () => {
        // Implement discard functionality here
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
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-out data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel
                        transition
                        className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
                    >
                        <div className="mt-2">
                            <div className="mt-2">
                                <input
                                    type="text"
                                    className="border border-gray-300 text-gray-600 w-full h-10 pl-5 pr-10 bg-white hover:border-gray-400 focus:outline-none appearance-none"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="My awesome project name"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                onClick={handleDiscard}
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default NewProjectDialog;

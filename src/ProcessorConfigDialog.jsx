import React, {memo, useEffect, useState} from "react";
import { Dialog, Transition } from "@headlessui/react";
import useStore from "./store";
import CustomListbox from "./CustomListbox";

function ProcessorConfigDialog({ isOpen, setIsOpen, providerName, className, nodeId }) {

    const {getNodeData, setNodeData} = useStore()
    const {getProviderByNameAndClass, createProcessor} = useStore()
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [localNodeData, setLocalNodeData] = useState([])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const filteredProviders = getProviderByNameAndClass(providerName, className)
        setFilteredProviders(filteredProviders);
    }, [isOpen]);

    const onProviderChange = (provider_id) => {
        // refresh the zustand node data state
        setNodeData(nodeId, {
            provider_id: provider_id
        })

        // refresh the local node data state
        setLocalNodeData(getNodeData(nodeId))
    }

    const handleDiscard = () => {
        setIsOpen(false);
    };

    const handleSave = async () => {
        const processor = await createProcessor(nodeId)
        console.log('saved processor: ' + processor)
        setIsOpen(false);
    }

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="min-w-[300pt] max-w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    {/*{localNodeData?.id}*/}
                                    {/*{localNodeData?.provider_id}*/}
                                </Dialog.Title>

                                <div className="flex flex-wrap -m-2 min-h-28">
                                    <div className="p-2 w-full sm:w-1/3">
                                        <div className="relative inline-block w-full text-gray-700">
                                            <CustomListbox
                                                placeholder="Select provider..."
                                                option_value_key="id"
                                                option_label_key="id"
                                                options={filteredProviders}
                                                onChange={onProviderChange}
                                                value={localNodeData?.provider_id}>
                                            </CustomListbox>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        onClick={handleDiscard}>
                                        Discard
                                    </button>

                                    <button
                                        type="button"
                                            className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={handleSave}>
                                            Save
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
);
}

export default memo(ProcessorConfigDialog);

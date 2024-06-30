import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from "@headlessui/react";

function WebSocketChatDialog({ isOpen, setIsOpen, projectId }) {

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        if (!isOpen)  return

        ws.current = new WebSocket('ws://localhost:8000/streams/ws');
        ws.current.onmessage = (event) => {
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        return () => {
            ws.current.close();
        }
    }, [isOpen]);

    const sendMessage = (event) => {
        event.preventDefault();
        if (messageText.trim()) {
            ws.current.send(messageText);
            setMessageText('');
        }
    };

    const handleDiscard = () => {
        // Implement discard functionality here
        setIsOpen(false);
    };

    const handleSave = () => {
        // Implement save functionality here
        setIsOpen(false);
    };

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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    <h1 className="text-2xl font-bold p-4 bg-blue-600 text-white">
                                        Streaming Chat Test
                                    </h1>
                                </Dialog.Title>
                                <div className="flex flex-col h-full bg-gray-100">
                                    <div className="flex flex-col flex-grow p-4 overflow-auto bg-white">
                                        <ul className="space-y-2">
                                            {messages.map((message, index) => (
                                                <li key={index} className="p-2 bg-gray-200 rounded-lg">
                                                    {message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <form onSubmit={sendMessage} className="flex p-4 bg-gray-200">
                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            autoComplete="off"
                                            className="flex-grow p-2 border rounded-lg"
                                            placeholder="Type a message..."
                                        />
                                        <button type="submit"
                                                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg">Send
                                        </button>
                                    </form>
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
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default WebSocketChatDialog;

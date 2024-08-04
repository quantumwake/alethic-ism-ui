import React, {useState, useEffect, useRef, useCallback} from 'react';
import { Dialog, Transition } from "@headlessui/react";
import sanitizeHtml from 'sanitize-html';

function StateStreamDialog({ isOpen, setIsOpen, nodeId }) {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const ws = useRef(null);

    const chatContentRef = useRef(null);
    const currentMessageRef = useRef('');

    const DONE_TOKEN = "<<>>DONE<<>>";

    const appendMessage = (newMessage) => {
        if (newMessage !== '') {
            // setMessages([...messages, currentMessageRef.current])
            setMessages(prevMessages => [...prevMessages, newMessage]);
            currentMessageRef.current = '';
        }
    }

    useEffect(() => {
        if (!isOpen) return;

        ws.current = new WebSocket(`ws://localhost:8080/ws/${nodeId}`);
        ws.current.onmessage = (event) => {
            const newData = event.data;
            if (newData.includes(DONE_TOKEN)) {
                const msg = currentMessageRef.current
                console.log("****" + msg)
                if (!currentMessageRef.current.trim()) {
                    return
                }
                appendMessage(msg)
            } else {
                currentMessageRef.current += newData;
                console.log(">>>>" + currentMessageRef.current)
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [messages]);

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
                            <Dialog.Panel className="w-full max-w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    <h1 className="text-2xl font-bold p-4 bg-blue-600 text-white">
                                        Streaming Chat Test
                                    </h1>
                                </Dialog.Title>
                                <div className="flex flex-col h-full bg-gray-100">
                                    {/*<div className="flex flex-col flex-grow p-4 overflow-auto bg-white">*/}
                                    {/*    <div ref={chatContentRef}>*/}
                                    {/*        {messages.map((message, index) => (*/}
                                    {/*            <div*/}
                                    {/*                key={index}*/}
                                    {/*                className="whitespace-pre-wrap break-words bg-gray-200 rounded p-2 mb-3"*/}
                                    {/*                dangerouslySetInnerHTML={{__html: message}}*/}
                                    {/*            />*/}
                                    {/*        ))}*/}
                                    {/*        {currentMessageRef.current && (*/}
                                    {/*            <div*/}
                                    {/*                className="whitespace-pre-wrap break-words bg-gray-200 rounded p-2"*/}
                                    {/*                dangerouslySetInnerHTML={{__html: currentMessageRef.current}}*/}
                                    {/*            />*/}
                                    {/*        )}*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                    <div className="flex flex-col flex-grow p-4 overflow-auto bg-white, border-2 border-gray-300 rounded-m shadow-gray-900 shadow-sm p-2">
                                        <div>***** MESSAGES ******</div>
                                        {messages.map((message, index) => (
                                            <div>
                                                <div>MESSAGE {index}</div>
                                                <div key={index} className="whitespace-pre-wrap break-words bg-gray-200 rounded p-2 mb-3 border-2 border-amber-700">
                                                    {/*<sanitizedHTML html={message} />*/}
                                                    {message}
                                                </div>
                                            </div>
                                        ))}

                                        <div ref={chatContentRef}>
                                            <div>***** CURRENT ******</div>
                                            {currentMessageRef.current && (
                                                <div
                                                    className="whitespace-pre-wrap break-words bg-gray-200 rounded p-2 border-green-500 border-2">
                                                    {/*<sanitizeHtml html={currentMessageRef.current}/>*/}
                                                    {currentMessageRef.current}
                                                </div>
                                            )}
                                        </div>
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

export default StateStreamDialog;

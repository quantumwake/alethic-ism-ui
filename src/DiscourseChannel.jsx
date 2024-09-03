import React, {useState, useEffect, useRef, useCallback, memo} from 'react';
import { Dialog, Transition } from "@headlessui/react";
import useStore from "./store";
import {useParams} from "react-router-dom";
// import sanitizeHtml from 'sanitize-html';

function DiscourseChannel( ) {

    const {isid, osid, sid, uid} = useParams();

    const messageRef2 = useRef('')
    const messageRef = useRef(''); // Ref for accessing the DOM element
    const [message, setMessage] = useState('');
    // const currentMessageRef = useRef(''); // Ref for storing message data

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const ws = useRef(null);
    const {publishQueryState} = useStore()


    const chatContentRef = useRef(null);

    const ASSISTANT_TOKEN = "<<>>ASSISTANT<<>>";
    const SOURCE_TOKEN = "<<>>SOURCE<<>>";
    const INPUT_TOKEN = "<<>>INPUT<<>>";
    const ERROR_TOKEN = "<<>>ERROR<<>>";
    // const DONE_TOKEN = "<<>>DONE<<>>";
    const ISM_STREAM_API_BASE_URL = window.env.REACT_APP_ISM_STREAM_API_BASE_URL

    const appendMessage2 = (user, role, message) => {
        if (message !== '') {
            message = {
                "content": message,
                "role": role,
                "user": user
            }
            setMessages(prevMessages => [...prevMessages, message]);
        }
    }

    useEffect(() => {
        if (ws.current) {
            console.log("already connected to websocket")
            return
        }

        console.log('websocket ready to establish');
        const URL = `${ISM_STREAM_API_BASE_URL}/ws/stream/${osid}/${sid}`
        ws.current = new WebSocket(URL);

        ws.current.onopen = () => {
            console.log('websocket connection established');
        };

        ws.current.onclose = () => {
            console.log('websocket connection closed');
        }

        const reader = new ReadableStream({
            start(controller) {
                ws.current.onmessage = (event) => {
                    controller.enqueue(event.data);
                };
                ws.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    controller.error(error);
                };
            },
            cancel() {
                ws.current.close();
            }
        }).getReader();

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const processStream = async () => {
            try {
                let previous_value = ""
                let current_user = ""
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }

                    if (value.includes(SOURCE_TOKEN)) {
                        current_user = previous_value
                        setMessage('')
                        messageRef.current = '';
                    } else if (value.includes(INPUT_TOKEN)) {
                        appendMessage2(current_user, "user", messageRef.current)
                        setMessage('')
                        messageRef.current = '';
                    } else if (value.includes(ASSISTANT_TOKEN)) {
                        appendMessage2("assistant", "assistant", messageRef.current)
                        setMessage('')
                        messageRef.current = '';
                    } else if (value.includes(ERROR_TOKEN)) {
                        appendMessage2("assistant", "assistant", messageRef.current + ' **ERROR**')
                        setMessage('')
                        messageRef.current = '';
                    } else {
                        setMessage(prev => prev + value);
                        messageRef.current += value
                    }
                    await delay(1); // 100ms delay, adjust as needed
                    previous_value = value  // store this for next iteration
                }
            } catch (error) {
                console.error('Stream reading error:', error);
            }
        };

        processStream();


    }, []);

    useEffect(() => {
        // Scroll to the bottom whenever messages are updated
        if (messageRef2) {
            messageRef2.current.scrollIntoView({ behavior: 'smooth' });
            // chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [message]);

    useEffect(() => {
        if (chatContentRef.current) {
            chatContentRef.current.scrollIntoView({ behavior: 'smooth' });
            // chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (event) => {
        event.preventDefault();
        if (messageText.trim()) {
            const queryState = {
                "input": messageText,
                "session_id": sid,
                "source": uid,
            }

            setMessageText('');
            await publishQueryState(isid, queryState)
        }

        // setIsOpen(false);
    };

    return (
        <div className="flex flex-col h-screen bg-black text-green-500 font-mono">
            {/* Header */}
            <header className="bg-black text-green-500 p-4 border-b border-green-500">
                <div>
                    <h1 className="text-xl">DISCOURSE CHANNEL</h1>
                    <p>{isid}:{osid}:{sid}:{uid}</p>
                </div>
            </header>

            {/* Chat Content */}
            <div
                className="flex flex-col flex-grow p-4 overflow-auto bg-black border border-green-500"
            >
                <div className="mb-4">***** MESSAGES *****</div>
                <div ref={chatContentRef}>
                    {messages.map((message, index) => (
                        <div key={index} className="mb-4">
                            <div>MESSAGE {index}</div>
                            <div
                                className="whitespace-pre-wrap break-words bg-blend-darken text-green-300 p-2 border border-green-500">
                                <div className="font-bold">{message['user']}: </div>
                                {/*{message['user']}: {message['content']}*/}
                                <div dangerouslySetInnerHTML={{__html: message['content']}}/>
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 mb-2">***** CURRENT *****</div>
                    <div
                        // className="whitespace-pre-wrap break-words bg-blend-darken text-green-100 p-2 border border-green-500 min-h-[100px] max-h-[300px] overflow-y-auto"
                    >
                        <div ref={messageRef2}><div dangerouslySetInnerHTML={{ __html: message }} /></div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black p-4 border-t border-green-500">
                <form onSubmit={sendMessage} className="flex">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-grow p-2 bg-green-950 text-green-100 border border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-black border border-green-500 hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        SEND
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default memo(DiscourseChannel);

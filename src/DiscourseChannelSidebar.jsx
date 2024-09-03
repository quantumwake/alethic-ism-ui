import React, {useState, useEffect, useRef, useCallback, memo} from 'react';
import { Dialog, Transition } from "@headlessui/react";
import useStore from "./store";
import {useParams} from "react-router-dom";
import InfoButton from "./InfoButton";
import CustomListbox from "./CustomListbox";
import CustomButton from "./CustomButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {create} from "zustand";
import uuidv4 from "./utils";
// import sanitizeHtml from 'sanitize-html';
const configOptions = [
    {config_type: 'StateConfig', config_name: 'Basic'},
    {config_type: 'StateConfigLM', config_name: 'Language'},
    {config_type: 'StateConfigDB', config_name: 'Database'},
    {config_type: 'StateConfigVisual', config_name: 'Visual'},
    {config_type: 'StateConfigCode', config_name: 'Code'},
    {config_type: 'StateConfigStream', config_name: 'Stream'}
];

function ChannelObserver( ) {

    // const {isid, osid, sid, uid} = useParams();

    const [connected, setConnected] = useState(false);
    const [channelSessionId, setChannelSessionId] = useState("");
    const [channelCompositeKey, setChannelCompositeKey] = useState("");

    // channelSessionId: null,
    //     setChannelSessionId: (channelSessionId) => set({channelSessionId: channelSessionId}),

    const messageRef2 = useRef('')
    const messageRef = useRef(''); // Ref for accessing the DOM element
    const [message, setMessage] = useState('');
    const {userId} = useStore()

    // const currentMessageRef = useRef(''); // Ref for storing message data

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const ws = useRef(null);
    const {publishQueryState} = useStore()

    const {
        channelInputId,
        channelOutputId,
        setChannelInputId,
        setChannelOutputId,
        createSession
    } = useStore()

    // const channelSessionId = "hello-world"
    // const channelSubscriberId = userId

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
        // const initializeSession = async () => {
        //     if (!channelSessionId) {
        //         try {
        //             await createSession();
        //         } catch (error) {
        //             console.error("Failed to create session:", error);
        //         }
        //     }
        // };
        //
        // initializeSession().then(r => {console.log(`session created ${channelSessionId}`)});

        if (channelInputId && channelOutputId) {
            console.log("match: " + channelInputId + " : " + channelOutputId)
            disconnect()    // disconnect from any previous connection if any
            connect()       // connect to new connection
        }
        console.log(channelInputId + " : " + channelOutputId)

    }, [channelInputId, channelOutputId]);

    const connect = () => {

        console.log('websocket ready to establish');
        let URL = `${ISM_STREAM_API_BASE_URL}/ws/stream/${channelOutputId}`
        if (channelSessionId) {
            URL = `${ISM_STREAM_API_BASE_URL}/ws/stream/${channelOutputId}/${channelSessionId}`
        }

        ws.current = new WebSocket(URL);
        ws.current.onopen = () => {
            console.log('websocket connection established');
            setConnected(true);  // Set connected to true when the connection is opened
        };

        ws.current.onclose = () => {
            console.log('websocket connection closed');
            setConnected(false);  // Set connected to true when the connection is opened
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
    }

    useEffect(() => {
        if (ws.current) {
            console.log("already connected to websocket")
            return
        }

    }, []);

    useEffect(() => {
        // Scroll to the bottom whenever messages are updated
        if (messageRef2) {
            messageRef2.current.scrollIntoView({ behavior: 'instant' });
        }
    }, [message]);
    //
    // useEffect(() => {
    //     if (chatContentRef.current) {
    //         chatContentRef.current.scrollIntoView({ behavior: 'smooth' });
    //         // chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    //     }
    // }, [messages]);

    const sendMessage = async (event) => {
        event.preventDefault();
        if (messageText.trim()) {
            let queryState = {
                "input": messageText,
                "source": userId,
            }

            if (channelSessionId) {
                queryState["session_id"] = channelSessionId
            }

            if (channelCompositeKey) {
                queryState["__composite_key__"] = channelCompositeKey
            }

            setMessageText('');
            await publishQueryState(channelInputId, queryState)
        }

        // setIsOpen(false);
    };

    const newSession = async() => {
        const session_id = await createSession()
        setChannelSessionId(session_id)
        setMessages([])
    }

    const newCompositeKey = async() => {
        setChannelCompositeKey(uuidv4())
    }

    const disconnect = () => {
        if (ws.current) {
            ws.current.close();  // Close the WebSocket connection
            console.log('WebSocket connection closed');
            ws.current = null;    // Optionally set it to null to indicate it's closed
        }
    };

    return (
        <div className="flex flex-col h-full m-0 p-2 border-0 bg-black text-green-200 text-xs font-mono">
            {/*<header className="bg-black text-green-200 p-0 border-b border-green-200">*/}
            <div className="font-bold text-green-100 text-md">
                CHANNEL I/O ANALYZER
            </div>
            <div className="mt-2 text-xs">
                <div>
                    Connected: {connected ? 'Yes' : 'No'}
                </div>

                <div className="mt-2">
                    Ingress: {channelInputId}
                    <button onClick={() => setChannelInputId("")} className="ml-2 text-red-500">x</button>
                </div>
                <div className="mt-2">
                    Egress: {channelOutputId}
                    <button onClick={() => setChannelOutputId("")} className="ml-2 text-red-500">x</button>
                </div>
                <div className="mt-2">
                    Session: {channelSessionId}
                    <button onClick={() => setChannelSessionId("")} className="ml-2 text-red-500">x</button>
                    <button onClick={() => newSession()} className="ml-2 text-red-500">#</button>
                </div>
                <div className="mt-2">
                    Composite Key: {channelCompositeKey}
                    <button onClick={() => setChannelCompositeKey("")} className="ml-2 text-red-500">x</button>
                    <button onClick={() => newCompositeKey()} className="ml-2 text-red-500">#</button>
                </div>
                <div className="mt-2 mb-2">
                    Subscriber: {userId}
                    {/*<button onClick={() => clearUserId()} className="ml-2 text-red-500">x</button>*/}
                </div>

                <button
                    type="button"
                    className="mb-2 px-4 py-2 bg-green-500 text-black border border-green-500 hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                    onClick={newSession}>
                    <span>New Session</span>
                </button>

                <button
                    type="button"
                    className="mb-2 px-4 py-2 bg-red-500 text-white border border-red-500 hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                    onClick={disconnect}>
                    <span>Disconnect</span>
                </button>
            </div>


            {/*<td className="w-1/2 px-3 py-3">*/}
            {/*    <CustomListbox*/}
            {/*        option_value_key="config_type"*/}
            {/*        option_label_key="config_name"*/}
            {/*        options={configOptions}*/}
            {/*        value="StateConfig">*/}
            {/*    </CustomListbox>*/}
            {/*</td>*/}

            {/*</header>*/}

            {/* Chat Content */}
            <div className="flex flex-col h-screen p-2 overflow-auto bg-black border border-green-200">

                <div className="mt-4">***** MESSAGES *****</div>
                <div ref={chatContentRef}>
                    {messages.map((message, index) => (
                        <div key={index} className="mb-4">
                            <div>MESSAGE {index}</div>
                            <div
                                className="whitespace-pre-wrap break-words bg-blend-darken text-green-300 p-2 border border-green-200">
                                <div className="font-bold">{message['user']}:</div>
                                {/*{message['user']}: {message['content']}*/}
                                <div dangerouslySetInnerHTML={{__html: message['content']}}/>
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 mb-2">***** CURRENT *****</div>
                    <div ref={messageRef2}>
                        <div dangerouslySetInnerHTML={{__html: message}}/>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black p-4 border-t border-green-200">
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

export default memo(ChannelObserver);

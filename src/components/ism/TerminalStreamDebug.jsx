import themes from "../../themes"
import React, { useState, useRef, useEffect, memo } from 'react';
import {
    GripHorizontal,
    X,
    ChevronDown,
    ChevronRight,
    Send,
    Power,
    Hash,
    Plus,
} from 'lucide-react';
import {useStore} from "../../store";
import uuidv4 from "../../utils";
import ResizableWindow from "../../standard/ResizableWindow";
import {TerminalButton, TerminalInput} from "../common";

const InfoRow = ({ label, value, onClear, onNew, theme }) => (
    <div className="flex items-center gap-2 text-xs">
        <span className={theme.textMuted}>{label}:</span>
        <span className={theme.text}>{value || 'none'}</span>
        {value && (
            <button onClick={onClear} className={`${theme.error} hover:opacity-80`}>
                <X className="w-3 h-3" />
            </button>
        )}
        {onNew && (
            <button onClick={onNew} className={`${theme.textAccent} hover:opacity-80`}>
                <Hash className="w-3 h-3" />
            </button>
        )}
    </div>
);

const Message = ({ message, index, theme }) => (
    <div className="mb-2">
        <div className={`text-xs ${theme.textMuted}`}>MESSAGE {index}</div>
        <div className={`whitespace-pre-wrap break-words p-1.5 border ${theme.border} rounded-sm`}>
            <div className={`text-xs font-bold ${theme.textAccent}`}>{message.user}</div>
            <div className={`text-xs ${theme.text}`} dangerouslySetInnerHTML={{ __html: message.content }} />
        </div>
    </div>
);

const TerminalStreamDebug = () => {
    const [position, setPosition] = useState({x: 20, y: 20});
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
    const [isMinimized, setIsMinimized] = useState(false);
    const [connected, setConnected] = useState(false);
    const [channelSessionId, setChannelSessionId] = useState("");
    const [channelCompositeKey, setChannelCompositeKey] = useState("");
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [messageText, setMessageText] = useState('');

    const messageRef2 = useRef(null)
    const messageRef = useRef(''); // Ref for accessing the DOM element
    const chatContentRef = useRef(null);
    const ws = useRef(null);

    const theme = useStore(state => state.getCurrentTheme());

    const {
        userId,
        channelInputId,
        channelOutputId,
        setChannelInputId,
        setChannelOutputId,
        createSession,
        publishQueryState
    } = useStore();

    const ASSISTANT_TOKEN = "<<>>ASSISTANT<<>>";
    const SOURCE_TOKEN = "<<>>SOURCE<<>>";
    const INPUT_TOKEN = "<<>>INPUT<<>>";
    const ERROR_TOKEN = "<<>>ERROR<<>>";
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
                    const {done, value} = await reader.read();
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
        // if (messageRef2) {
        //     messageRef2.current.scrollIntoView({ behavior: 'instant' });
        // }
    }, [message]);

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

    const newSession = async () => {
        const session_id = await createSession()
        setChannelSessionId(session_id)
        setMessages([])
    }

    const newCompositeKey = async () => {
        setChannelCompositeKey(uuidv4())
    }

    const disconnect = () => {
        if (ws.current) {
            ws.current.close();  // Close the WebSocket connection
            console.log('WebSocket connection closed');
            ws.current = null;    // Optionally set it to null to indicate it's closed
        }
    };

    const handleMouseDown = (e) => {
        if (e.target.closest('.handle')) {
            setIsDragging(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <ResizableWindow
            initialSize={{width: 400, height: 600}}
            minSize={{width: 300, height: 400}}
            maxSize={{width: 800, height: 1000}}
            theme={theme}
            className={`${theme.bg} ${theme.border}`}>
            <div className="flex flex-col h-full w-full font-mono">
                <div
                    className={`flex items-center justify-between px-2 py-1 handle cursor-grab border-b ${theme.border}`}>
                    <div className="flex items-center gap-1.5">
                        <GripHorizontal className={`w-3 h-3 ${theme.textAccent}`}/>
                        <span className={`text-xs ${theme.text}`}>CHANNEL I/O ANALYZER</span>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className={`p-0.5 ${theme.hover} ${theme.textAccent}`}
                        >
                            {isMinimized ? <ChevronRight className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                        </button>
                        <button
                            onClick={() => setIsMinimized(true)}
                            className={`p-0.5 ${theme.hover} ${theme.textAccent}`}
                        >
                            <X className="w-3 h-3"/>
                        </button>
                    </div>
                </div>


                {!isMinimized && (<>
                    <div className={`p-1.5 border-b ${theme.border}`}>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                                <span className={theme.textMuted}>Status:</span>
                                <span className={connected ? theme.success : theme.error}>
                            {connected ? 'Connected' : 'Disconnected'}</span>
                            </div>

                            <InfoRow label="Ingress" value={channelInputId} onClear={() => setChannelInputId("")}
                                     theme={theme}/>
                            <InfoRow label="Egress" value={channelOutputId} onClear={() => setChannelOutputId("")}
                                     theme={theme}/>
                            <InfoRow
                                label="Session"
                                value={channelSessionId}
                                onClear={() => setChannelSessionId("")}
                                onNew={newSession}
                                theme={theme}/>
                            <InfoRow
                                label="Composite Key"
                                value={channelCompositeKey}
                                onClear={() => setChannelCompositeKey("")}
                                onNew={newCompositeKey}
                                theme={theme}/>
                            <InfoRow label="Subscriber" value={userId} theme={theme}/>

                            <div className="flex items-center gap-1.5 pt-1">
                                <TerminalButton
                                    onClick={newSession}
                                    className={`flex items-center gap-1 px-2 py-1 text-xs ${theme.border} ${theme.hover} rounded-sm`}>
                                    <Plus className="w-3 h-3"/>
                                    <span>New Session</span>
                                </TerminalButton>
                                <TerminalButton
                                    onClick={disconnect}
                                    className={`flex items-center gap-1 px-2 py-1 text-xs ${theme.border} ${theme.hover} rounded-sm ${theme.error}`}>
                                    <Power className="w-3 h-3"/>
                                    <span>Disconnect</span>
                                </TerminalButton>
                            </div>
                        </div>
                    </div>

                    <div className={`flex-1 p-1.5 border-b ${theme.border} h-full overflow-y-auto`}>
                        <div className={`text-xs ${theme.textMuted} mb-1`}>***** MESSAGES *****</div>
                        <div ref={chatContentRef}>
                            {messages.map((msg, index) => (
                                <Message key={index} message={msg} index={index} theme={theme}/>
                            ))}

                            {message && (
                                <>
                                    <div className={`text-xs ${theme.textMuted} mt-2 mb-1`}>***** CURRENT *****
                                    </div>
                                    <div ref={messageRef2}>
                                        <div className={`text-xs ${theme.text}`}
                                             dangerouslySetInnerHTML={{__html: message}}/>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <form onSubmit={sendMessage} className="flex w-full p-1.5 gap-1">
                        {/*<input type="text" value={messageText}*/}
                        {/*       onChange={(e) => setMessageText(e.target.value)}*/}
                        {/*       className={`flex-1 px-2 py-1 text-xs ${theme.text} ${theme.input} rounded-sm focus:outline-none focus:ring-1`}*/}
                        {/*       placeholder="Enter message..."/>*/}
                        <TerminalInput onChange={(e) => setMessageText(e.target.value)}
                                   className={`flex-1 px-2 py-1 text-xs ${theme.text} ${theme.input} rounded-sm focus:outline-none focus:ring-1`}
                                   placeholder="Enter message..."
                                   icon={<Send className={`w-3 h-3 ${theme.textAccent}`}/>}
                        />

                        <button type="submit" className={`p-1 ${theme.hover} ${theme.border} rounded-sm`}>
                            <Send className={`w-3 h-3 ${theme.textAccent}`}/>
                        </button>
                    </form>
                </>)}
            </div>
        </ResizableWindow>
    )
}

export default memo(TerminalStreamDebug);

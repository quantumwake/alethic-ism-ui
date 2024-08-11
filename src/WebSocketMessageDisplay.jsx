import {useEffect, useRef, useState} from "react";

const WebSocketMessageDisplay = () => {
    const [fullMessage, setFullMessage] = useState('');
    const messageSpanRef = useRef(null);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080/ws/6a793dc6-9b83-44f1-bcc0-bc6ec20586ce/bc6ec2456');

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.current.onmessage = (event) => {
            setFullMessage(prev => prev + event.data);

            // Update the single span's content directly
            if (messageSpanRef.current) {
                messageSpanRef.current.textContent += event.data;
                messageSpanRef.current.parentElement.scrollTop = messageSpanRef.current.parentElement.scrollHeight;
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Real-time WebSocket Messages</h2>
            <div className="bg-white p-3 rounded border border-gray-300 min-h-[100px] max-h-[300px] overflow-y-auto">
                <span ref={messageSpanRef} className="whitespace-pre-wrap"></span>
            </div>
        </div>
    );
};

export default WebSocketMessageDisplay;
import React, { useEffect, useRef, useState } from 'react';
const URL = 'ws://localhost:8080/ws/6a793dc6-9b83-44f1-bcc0-bc6ec20586ce/bc6ec2456';

const StreamingWebSocketDisplay = () => {
    const [message, setMessage] = useState('');
    const ws = useRef(null);

    const connect = () => {

    }

    useEffect(() => {
        ws.current = new WebSocket(URL);

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

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
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    await delay(100); // 100ms delay, adjust as needed
                    setMessage(prev => prev + value);
                }
            } catch (error) {
                console.error('Stream reading error:', error);
            }
        };

        processStream();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            reader.cancel();
        };
    }, []);

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Streaming WebSocket Messages</h2>
            <div className="bg-white p-3 rounded border border-gray-300 min-h-[100px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {message}
            </div>
        </div>
    );
};

export default StreamingWebSocketDisplay;
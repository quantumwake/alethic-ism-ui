import React, {useState, useEffect, useRef, memo} from 'react';
import useStore from "../store";
import uuidv4 from "../utils";

function ConfigurationView( ) {

    // useEffect(() => {

    //
    // }, []);

    return (
        <div className="flex flex-col h-full m-0 p-2 border-0 bg-black text-green-200 text-xs font-mono">
            {/*<header className="bg-black text-green-200 p-0 border-b border-green-200">*/}
            <div className="font-bold text-green-100 text-md">
                CHANNEL I/O ANALYZER
            </div>
            <div className="mt-2 text-xs">
                {/*<div>*/}
                {/*    Connected: {connected ? 'Yes' : 'No'}*/}
                {/*</div>*/}

                {/*<div className="mt-2">*/}
                {/*    Ingress: {channelInputId}*/}
                {/*    <button onClick={() => setChannelInputId("")} className="ml-2 text-red-500">x</button>*/}
                {/*</div>*/}
                {/*<div className="mt-2">*/}
                {/*    Egress: {channelOutputId}*/}
                {/*    <button onClick={() => setChannelOutputId("")} className="ml-2 text-red-500">x</button>*/}
                {/*</div>*/}
                {/*<div className="mt-2">*/}
                {/*    Session: {channelSessionId}*/}
                {/*    <button onClick={() => setChannelSessionId("")} className="ml-2 text-red-500">x</button>*/}
                {/*    <button onClick={() => newSession()} className="ml-2 text-red-500">#</button>*/}
                {/*</div>*/}
                {/*<div className="mt-2">*/}
                {/*    Composite Key: {channelCompositeKey}*/}
                {/*    <button onClick={() => setChannelCompositeKey("")} className="ml-2 text-red-500">x</button>*/}
                {/*    <button onClick={() => newCompositeKey()} className="ml-2 text-red-500">#</button>*/}
                {/*</div>*/}
                {/*<div className="mt-2 mb-2">*/}
                {/*    Subscriber: {userId}*/}
                {/*    /!*<button onClick={() => clearUserId()} className="ml-2 text-red-500">x</button>*!/*/}
                {/*</div>*/}

                {/*<button*/}
                {/*    type="button"*/}
                {/*    className="mb-2 px-4 py-2 bg-green-500 text-black border border-green-500 hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500"*/}
                {/*    onClick={newSession}>*/}
                {/*    <span>New Session</span>*/}
                {/*</button>*/}

                {/*<button*/}
                {/*    type="button"*/}
                {/*    className="mb-2 px-4 py-2 bg-red-500 text-white border border-red-500 hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500"*/}
                {/*    onClick={disconnect}>*/}
                {/*    <span>Disconnect</span>*/}
                {/*</button>*/}
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
                Hello World
                {/*<div className="mt-4">***** MESSAGES *****</div>*/}
                {/*<div ref={chatContentRef}>*/}
                {/*    {messages.map((message, index) => (*/}
                {/*        <div key={index} className="mb-4">*/}
                {/*            <div>MESSAGE {index}</div>*/}
                {/*            <div*/}
                {/*                className="whitespace-pre-wrap break-words bg-blend-darken text-green-300 p-2 border border-green-200">*/}
                {/*                <div className="font-bold">{message['user']}:</div>*/}
                {/*                /!*{message['user']}: {message['content']}*!/*/}
                {/*                <div dangerouslySetInnerHTML={{__html: message['content']}}/>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    ))}*/}

                {/*    <div className="mt-4 mb-2">***** CURRENT *****</div>*/}
                {/*    <div ref={messageRef2}>*/}
                {/*        <div dangerouslySetInnerHTML={{__html: message}}/>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>

            {/* Footer */}
            <footer className="bg-black p-4 border-t border-green-200">
                <form className="flex">
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    value={messageText}*/}
                    {/*    // onChange={(e) => setMessageText(e.target.value)}*/}
                    {/*    className="flex-grow p-2 bg-green-950 text-green-100 border border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"*/}
                    {/*    placeholder="Type a message..."*/}
                    {/*/>*/}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-black border border-green-500 hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        Save
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default memo(ConfigurationView);

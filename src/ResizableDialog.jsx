import { Dialog } from '@headlessui/react';
import { Resizable } from 'react-resizable';
import {useState} from "react";

const ResizableDialog = ({ children }) => {
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(300);

    return (
        <Resizable
            width={width}
            height={height}
            onResize={(e, { size }) => {
                setWidth(size.width);
                setHeight(size.height);
            }}
        >
            <>
                {children}
            </>
        </Resizable>
    );
};

export default ResizableDialog;

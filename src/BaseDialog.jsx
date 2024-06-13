import React, {memo, useState} from 'react';

function BaseDialog() {
    const [isExpanded, setExpanded] = useState({})

    const handleExpansion = (row, col, isExpanded) => {
        console.log(`expanding row: ${row}, column key: ${col}, value: ${isExpanded}`);
        setExpanded((prevExpanded) => ({
            ...prevExpanded,
            [`${row}-${col}`]: isExpanded,
        }));
    };


    return (
        <></>
    );
}

export default memo(BaseDialog);
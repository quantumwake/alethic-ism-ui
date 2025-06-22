import TerminalDataTable2 from "../common/TerminalDataTable2";
import {useStore} from "../../store";
import {memo, useEffect, useState} from "react";

const TerminalStateDataTable = ({ isOpen, onClose, nodeId, className = '' }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const {fetchState, publishQueryState} = useStore();
    const [table, setTable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(100);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const fetchData = async () => {
            try {
                const result = await fetchState(nodeId, true, false, offset, limit);
                setTable(result);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData().then(r => console.debug("completed fetch state data"));
    }, [isOpen, nodeId, fetchState, offset, limit]);

    if (loading) {
        return <div className={`${theme.text}`}>Loading...</div>;
    }

    if (error) {
        return <div className={`${theme.text} text-red-500`}>Error: {error}</div>;
    }

    const handlePreviousOffset = (currentLimit) => {
        const newOffset = Math.max(0, offset - currentLimit);
        setOffset(newOffset);
    };

    const handleForwardOffset = (currentLimit) => {
        if (table && offset + currentLimit < table.count) {
            setOffset(offset + currentLimit);
        }
    };

    const onCellTrigger = async(key, index, value) => {
        await publishQueryState(nodeId, value)
    }

    return (
        <TerminalDataTable2
            isOpen={isOpen}
            offset={offset}
            limit={limit}
            onClose={onClose}
            table={table}
            className={className}
            onPreviousOffset={offset > 0 ? handlePreviousOffset : null}
            onForwardOffset={table && offset + limit < table.count ? handleForwardOffset : null}
            onCellTrigger={onCellTrigger}
        />
    );
};

export default memo(TerminalStateDataTable)
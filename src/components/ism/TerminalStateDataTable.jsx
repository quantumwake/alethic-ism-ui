import TerminalDataTable2 from "../common/TerminalDataTable2";
import {useStore} from "../../store";
import {memo, useEffect, useState} from "react";

const TerminalStateDataTable = ({ isOpen, onClose, nodeId, className = '' }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const {fetchState} = useStore();
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
    }, [isOpen, nodeId, fetchState]);

    if (loading) {
        return <div className={`${theme.text}`}>Loading...</div>;
    }

    if (error) {
        return <div className={`${theme.text} text-red-500`}>Error: {error}</div>;
    }

    return (
        <TerminalDataTable2
            isOpen={isOpen}
            limit={limit}
            onClose={onClose}
            table={table}
            className={className}
        />
    );
};

export default memo(TerminalStateDataTable)
import TerminalDataTable2 from "../common/TerminalDataTable2";
import {useStore} from "../../store";
import {memo, useEffect, useState} from "react";

const TerminalStateDataTable = ({ isOpen, onClose, nodeId, className = '' }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const {fetchState} = useStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getData = async () => {
            // setLoading(true);
            setError(null);
            try {
                const result = await fetchState(nodeId, true, false);
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                // setLoading(false);
            }
        };
        if (isOpen) getData().then(r => {
            console.debug("fetch state data completed")
        });
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
            onClose={onClose}
            data={data}
            className={className}
        />
    );
};

export default memo(TerminalStateDataTable)
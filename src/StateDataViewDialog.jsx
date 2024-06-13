import React, {memo, useEffect, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import useStore from "./store";

function StateDataViewDialog({ isOpen, setIsOpen, nodeId }) {
    const fetchState = useStore(state => state.fetchState);

    // const [expanded, setExpanded] = useState({})
    const [isExpanded, setExpanded] = useState({})
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const handleExpansion = (row, col, isExpanded) => {
        console.log(`expanding row: ${row}, column key: ${col}, value: ${isExpanded}`);
        setExpanded((prevExpanded) => ({
            ...prevExpanded,
            [`${row}-${col}`]: isExpanded,
        }));
    };


    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchState(nodeId, true, false);
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen)
            getData().then(r => {})

    }, [isOpen, nodeId, fetchState]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const handleClose = () => {
        setIsOpen(false);
    };


    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={handleClose}>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">

                        <Dialog.Panel
                            className="w-full max-w-full min-w-[700px] transform overflow-hidden rounded-md bg-white p-2 text-left align-middle shadow-xl transition-all">
                            {/*<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">*/}
                            {/*    State Data View*/}
                            {/*</Dialog.Title>*/}
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                    <tr className="align-text-top bg-gray-200 text-gray-600 text-sm leading-normal">
                                        {data?.columns &&
                                            Object.entries(data.columns).map(([key, column]) => (
                                                <th key={key} className="py-3 px-6 text-left">
                                                    {column.name}
                                                </th>
                                            ))}
                                    </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">
                                    {data?.data &&
                                        Array.from({length: data.count}).map((_, rowIndex) => {
                                            const rowData = data.data; // Extract data for easy access

                                            return (
                                                <tr key={rowIndex}
                                                    className={`max-w-lg border-b border-gray-200 hover:bg-gray-100 ${
                                                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}>
                                                    {Object.keys(data.columns).map((columnKey) => {
                                                        const column = data.columns[columnKey]
                                                        let value = column.value
                                                        // if (!column.value || column.callable) {
                                                        if (columnKey in rowData) {
                                                            value = rowData[columnKey]?.values[rowIndex]
                                                        } else {
                                                            value = "state data inconsistent, no data found for column"
                                                        }
                                                        // }

                                                        return (
                                                            <td key={columnKey}
                                                                className="align-text-top max-w-lg py-3 px-6 text-left">
                                                                {(isExpanded[rowIndex + "-" + columnKey] || value === null || value?.length <= 30) ? (
                                                                    value
                                                                ) : (
                                                                    <>
                                                                        {value?.slice(0, 30)}{' '} {/* Truncate to 30 chars */}
                                                                        <span
                                                                            onClick={() => handleExpansion(rowIndex, columnKey, true)}>...</span>
                                                                    </>
                                                                )}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default memo(StateDataViewDialog);
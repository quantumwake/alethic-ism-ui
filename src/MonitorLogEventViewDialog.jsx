import React, {memo, useEffect, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import useStore from "./store";

function MonitorLogEventViewDialog({ isOpen, setIsOpen, projectId }) {

    const fetchMonitorLogEvent = useStore(state => state.fetchMonitorLogEvents);

    // const [expanded, setExpanded] = useState({})
    // const [isExpanded, setExpanded] = useState({})

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // const handleExpansion = (row, col, isExpanded) => {
    //     console.log(`expanding row: ${row}, column key: ${col}, value: ${isExpanded}`);
    //     setExpanded((prevExpanded) => ({
    //         ...prevExpanded,
    //         [`${row}-${col}`]: isExpanded,
    //     }));
    // };


    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchMonitorLogEvent(projectId);
                setData(result);
            } catch (error) {
                setError(error.message);
                setData([])
            } finally {
                setLoading(false);
            }
        };

        if (isOpen)
            getData().then(r => {});

    }, [isOpen, projectId, fetchMonitorLogEvent]);

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
                            className="w-full max-w-[1280px] min-w-[700px] transform overflow-hidden rounded-md bg-white p-2 text-left align-middle shadow-xl transition-all">
                            {/*<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">*/}
                            {/*    State Data View*/}
                            {/*</Dialog.Title>*/}
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                    <tr className="align-text-top bg-gray-200 text-gray-600 text-sm leading-normal">
                                        <th className="py-3 px-6 text-left">
                                            Id
                                        </th>
                                        <th className="py-3 px-6 text-left">
                                            Event
                                        </th>
                                        <th className="py-3 px-6 text-left">
                                            Time
                                        </th>
                                        <th className="py-3 px-6 text-left">
                                            Exception
                                        </th>
                                        <th className="py-3 px-6 text-left">
                                            Data
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">

                                    {data && data.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.log_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.log_type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.log_time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-pre-wrap">
                                                {item?.exception}
                                            </td>
                                            <td className="px-6 py-4 whitespace-pre-wrap">
                                                {item?.data}
                                            </td>
                                        </tr>
                                    ))}
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

export default memo(MonitorLogEventViewDialog);
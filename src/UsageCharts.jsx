import React, {useEffect, useState} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import useStore from "./store";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const usageData = [
//     {
//         user_id: "32c28618101f",
//         resource_id: null,
//         resource_type: "resource name",
//         project_id: null,
//         day: 1,
//         month: 6,
//         year: 2024,
//         unit_type: null,
//         unit_subtype: null,
//         total: 5873,
//         total_cost: 0.0
//     },
//     {
//         user_id: "32c28618101f",
//         resource_id: null,
//         resource_type: "resource name",
//         project_id: null,
//         day: 2,
//         month: 6,
//         year: 2024,
//         unit_type: null,
//         unit_subtype: null,
//         total: 2335,
//         total_cost: 0.0
//     }
//     // Add more data here...
// ];
function UsageReportDialog({ isOpen, setIsOpen }) {

    const [selectedResourceType, setSelectedResourceType] = useState('resource name');
    const [selectedYear, setSelectedYear] = useState(2024);
    const [selectedMonth, setSelectedMonth] = useState(6);
    const {chartsUsageReport, fetchUsageReportGroupForCharts} = useStore()

    useEffect(() => {
        if (!isOpen) {
            return
        }

        fetchUsageReportGroupForCharts()
    }, [isOpen])

    const filteredData = chartsUsageReport.filter(
        (data) =>
            // data.resource_type === selectedResourceType &&
            data.year === selectedYear &&
            data.month === selectedMonth
    );

    const chartLabels = filteredData.map((data) => data.day);
    // const chartData = filteredData.map((data) => data.total);

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: `Usage for ${selectedResourceType} in ${selectedMonth}/${selectedYear}`,
                data: chartData,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Usage for ${selectedResourceType} in ${selectedMonth}/${selectedYear}`,
            },
        },
    };

    const handleDiscard = () => {
        // Implement discard functionality here
        setIsOpen(false);
    };

    const handleSave = () => {
        // Implement save functionality here
        setIsOpen(false);
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-[800pt] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {/*<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">*/}
                                {/*    Simple Dialog*/}
                                {/*</Dialog.Title>*/}

                                <div className="m-2">
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Resource Type</label>
                                        <select
                                            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-400"
                                            value={selectedResourceType}
                                            onChange={(e) => setSelectedResourceType(e.target.value)}
                                        >
                                            {[...new Set(chartsUsageReport.map((data) => data.resource_type))].map((resource) => (
                                                <option key={resource} value={resource}>
                                                    {resource}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Year</label>
                                        <select
                                            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-400"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        >
                                            {[...new Set(chartsUsageReport.map((data) => data.year))].map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700">Month</label>
                                        <select
                                            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-400"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        >
                                            {[...new Set(chartsUsageReport.map((data) => data.month))].map((month) => (
                                                <option key={month} value={month}>
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-8">
                                        <Line data={data} options={options}/>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        onClick={handleDiscard}
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="button"
                                        className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default UsageReportDialog;

import React, { useState, useEffect, memo } from 'react';
import { Dialog as HeadlessDialog, DialogPanel as HeadlessDialogPanel } from '@headlessui/react';
import { Search as SearchIcon } from 'lucide-react';
import TerminalInput from './TerminalInput';
import {useStore} from '../../store';

const SearchField = ({ columnKey, theme, onSearch }) => (
    <TerminalInput
        icon={<SearchIcon className="w-4 h-4" />}
        size="small"
        variant="ghost"
        placeholder="Search..."
        onChange={(e) => onSearch(columnKey, e.target.value)}
        className="w-full"
    />
);

const TableHeader = ({ columns, theme, onSearch }) => (
    <thead>
    <tr>
        {columns && Object.entries(columns).map(([key, column]) => (
            <th key={key} className={`${theme.datatable.header} ${theme.border}`}>
                <div className="flex flex-col">
                    <div className="flex min-w-[50px]">
                        <div className="text-sm pr-4 uppercase">{column.name}</div>
                        <div className=""><SearchField columnKey={key} theme={theme} onSearch={onSearch}/></div>
                    </div>
                </div>
            </th>
        ))}
    </tr>
    </thead>
);

const TableCell = ({value, rowIndex, columnKey, theme, isExpanded, onExpand}) => (
    <td className={`border-r border-dashed ${theme.border} px-2 py-2 ${theme.text}`}>
        {(isExpanded[`${rowIndex}-${columnKey}`] || !value || value.length <= 80)
            ? value
            : (<>
                {value.slice(0, 80)}{' '}
                <button onClick={() => onExpand(rowIndex, columnKey, true)} className={`${theme.button.secondary} px-1 py-0.5 text-xs`}>...</button></>)}
    </td>
);

const TableBody = ({ data, theme, filterData, isExpanded, onExpand }) => (
    <tbody>
    {data?.data && Array.from({ length: data.count }).map((_, rowIndex) => filterData(rowIndex) && (
        <tr key={rowIndex} className={`border-b border-dashed ${theme.border} hover:${theme.button.primary}`}>
            {Object.keys(data.columns).map((columnKey) => (
                <TableCell
                    key={columnKey}
                    value={data.data[columnKey]?.values[rowIndex] ?? null}
                    rowIndex={rowIndex}
                    columnKey={columnKey}
                    theme={theme}
                    isExpanded={isExpanded}
                    onExpand={onExpand}
                />
            ))}
        </tr>
    ))}
    </tbody>
);

const TerminalDataTable = ({ isOpen, onClose, nodeId, className = '' }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const fetchState = useStore(state => state.fetchState);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setExpanded] = useState({});
    const [filters, setFilters] = useState({});

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
        if (isOpen) getData();
    }, [isOpen, nodeId, fetchState]);

    const handleExpansion = (row, col, expanded) => setExpanded(prev => ({ ...prev, [`${row}-${col}`]: expanded }));
    const handleSearch = (columnKey, value) => setFilters(prev => ({ ...prev, [columnKey]: value.toLowerCase() }));
    const filterData = (rowIndex) => Object.keys(filters).every(columnKey => {
        const filterValue = filters[columnKey];
        if (!filterValue) return true;
        const cellValue = data.data[columnKey]?.values[rowIndex];
        return cellValue?.toString().toLowerCase().includes(filterValue);
    });

    return (
        <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex items-center justify-center">
                <HeadlessDialogPanel className={`w-full max-w-[90vw] min-w-[700px] ${theme.bg} ${theme.border} border shadow-lg`}>
                    <div className="p-2 overflow-x-auto">
                        <table className="w-full">
                            <TableHeader columns={data?.columns} theme={theme} onSearch={handleSearch} />
                            <TableBody
                                data={data}
                                theme={theme}
                                filterData={filterData}
                                isExpanded={isExpanded}
                                onExpand={handleExpansion}
                            />
                        </table>
                    </div>
                </HeadlessDialogPanel>
            </div>
        </HeadlessDialog>
    );
};

export default memo(TerminalDataTable);
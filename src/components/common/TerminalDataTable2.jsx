// DataTable.jsx
import React, {memo, useState} from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import { Search as SearchIcon } from 'lucide-react';
import TerminalInput from './TerminalInput';
import useStore from "../../store";

const SearchField = ({ columnKey, onSearch }) => {
    return (
        <TerminalInput
            icon={<SearchIcon className="w-4 h-4" />}
            size="small"
            variant="ghost"
            placeholder="Search..."
            onChange={(e) => onSearch(columnKey, e.target.value)}
            className="w-full">
        </TerminalInput>
    )
}

const TableHeader = ({ columns, onSearch }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (<thead>
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
    </thead>)
}

const TableCell = ({value, rowIndex, columnKey, isExpanded, onExpand}) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <td className={`border-r border-dashed ${theme.border} px-2 py-2 ${theme.text}`}>
            {(isExpanded[`${rowIndex}-${columnKey}`] || !value || value.length <= 80)
                ? value
                : (<>
                    {value.slice(0, 80)}{' '}
                    <button onClick={() => onExpand(rowIndex, columnKey, true)}
                            className={`${theme.button.secondary} px-1 py-0.5 text-xs`}>...
                    </button>
                </>)}
        </td>
    )
}

const TableBody = ({ data, filterData, isExpanded, onExpand }) => {
    const theme = useStore(state => state.getCurrentTheme());

    // Helper to determine if data is in columnar format
    const isColumnarFormat = data?.data?.values || (data?.data && data?.columns && data?.count);

    if (isColumnarFormat) {
        // Handle original columnar format
        return (
            <tbody>
            {Array.from({ length: data.count }).map((_, rowIndex) => filterData(rowIndex) && (
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
    }

    // Handle array of objects format
    const columns = data?.length > 0 ? Object.keys(data[0]) : [];

    return (
        <tbody>
        {data?.map((row, rowIndex) => filterData(rowIndex) && (
            <tr key={rowIndex} className={`border-b border-dashed ${theme.border} hover:${theme.button.primary}`}>
                {columns.map((columnKey) => (
                    <TableCell
                        key={columnKey}
                        value={row[columnKey] ?? null}
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
};

const TerminalDataTable2 = ({
                       data,
                       isOpen,
                       onClose,
                       className = '',
                       modalProps = {}
                   }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [isExpanded, setExpanded] = useState({});
    const [filters, setFilters] = useState({});

    const handleExpansion = (row, col, expanded) => setExpanded(prev => ({ ...prev, [`${row}-${col}`]: expanded }));

    const handleSearch = (columnKey, value) => setFilters(prev => ({ ...prev, [columnKey]: value.toLowerCase() }));




// Update the filterData function in the main component to handle both formats
    const filterData = (rowIndex) => {
        const isColumnarFormat = data?.data?.values || (data?.data && data?.columns && data?.count);

        return Object.keys(filters).every(columnKey => {
            const filterValue = filters[columnKey];
            if (!filterValue) return true;

            let cellValue;
            if (isColumnarFormat) {
                cellValue = data.data[columnKey]?.values[rowIndex];
            } else {
                cellValue = data[rowIndex][columnKey];
            }

            return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
    };

    return (
        <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50" {...modalProps}>
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex items-center justify-center">
                <HeadlessDialog.Panel className={`w-full max-w-[90vw] min-w-[700px] ${theme.bg} ${theme.border} border shadow-lg ${className}`}>
                    <div className="p-2 overflow-x-auto">
                        <table className="w-full">
                            <TableHeader columns={data?.columns} onSearch={handleSearch} />
                            <TableBody
                                data={data}
                                filterData={filterData}
                                isExpanded={isExpanded}
                                onExpand={handleExpansion}
                            />
                        </table>
                    </div>
                </HeadlessDialog.Panel>
            </div>
        </HeadlessDialog>
    );
};

export default memo(TerminalDataTable2);
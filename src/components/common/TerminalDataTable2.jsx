// DataTable.jsx
import React, {memo, useEffect, useState} from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import { Search as SearchIcon } from 'lucide-react';
import TerminalInput from './TerminalInput';
import {useStore} from "../../store";

const SearchField = ({ columnKey, onSearch, placeholder }) => {
    return (
        <TerminalInput
            icon={<SearchIcon className="w-4 h-4" />}
            size="small"
            variant="ghost"
            placeholder={placeholder}
            onChange={(e) => onSearch(columnKey, e.target.value)}
            className="min-w-8 w-full">
        </TerminalInput>
    )
}

const TableHeader = ({ table, onSearch, isStateFormat }) => {
    const theme = useStore(state => state.getCurrentTheme());
    let columns = {}
    if (isStateFormat) {
        columns = table?.columns
    } else {
        columns = table?.length > 0 ? Object.keys(table[0]) : [];
    }

    return (<thead className="sticky top-0 bg-white z-10">
        <tr>
            <th className={`${theme.datatable.header} ${theme.border}`}>
                <div className="flex flex-col">
                    ??
                </div>
            </th>
            {columns && Object.entries(columns).map(([key, column]) => (
                <th key={key} className={`${theme.datatable.header} ${theme.border}`}>
                    <div className="flex flex-col">
                        <div className="flex min-w-[50px]">
                            <div className="text-sm pr-4 uppercase">{column.name}</div>
                            <SearchField placeholder={column.name} columnKey={key} theme={theme} onSearch={onSearch}/>
                        </div>
                    </div>
                </th>
            ))}
        </tr>
    </thead>)
}

const TableCell = ({value, rowIndex, columnKey, isExpanded, onExpand}) => {
    const theme = useStore(state => state.getCurrentTheme());

    const displayValue = (value) => {
        const type = typeof(value)
        switch (type) {
            case "number":
                return value
            case "string":
                return value?.slice(0, 80)
            default:
                return value
        }
    }

    return (
        <td className={`border-r border-dashed ${theme.border} px-2 py-2 ${theme.text}`}>
            {(isExpanded[`${rowIndex}-${columnKey}`] || value?.length <= 80)
                ? value
                : (<>{displayValue(value)}{' '}
                    <button onClick={() => onExpand(rowIndex, columnKey, true)}
                            className={`${theme.button.secondary} px-1 py-0.5 text-xs`}>...
                    </button>
                </>)}
        </td>
    )
}

const TableBody = ({ table, limit, filterData, isExpanded, onExpand, isStateFormat }) => {
    const theme = useStore(state => state.getCurrentTheme());

    // handle original state column data row value format
    if (isStateFormat && table?.data) {
        return (
            <tbody className="">
            {Array.from({ length: limit ?? table.count }).map((_, rowIndex) => filterData(rowIndex) && (
                <tr key={rowIndex} className={`border-b border-dashed ${theme.border} hover:${theme.button.primary}`}>
                    <TableCell key={`${rowIndex}-action`} value=""
                        rowIndex={rowIndex}
                        columnKey={`${rowIndex}-action`}
                        isExpanded={true}
                        onExpand={() => {}}
                    />

                    {Object.keys(table.columns).map((columnKey) => (
                        <TableCell key={columnKey}
                            value={table.data[columnKey]?.values[rowIndex] ?? null}
                            rowIndex={rowIndex}
                            columnKey={columnKey}
                            isExpanded={isExpanded}
                            onExpand={onExpand}
                        />
                    ))}
                </tr>
            ))}
            </tbody>
        );
    }

    // as opposed to a set of dictionary rows composed of [{column=value, ...}].
    if (!isStateFormat && table?.length) {
        // Handle array of objects format
        const columns = table?.length > 0 ? Object.keys(table[0]) : [];
        return (
            <tbody>
            {table?.map((row, rowIndex) => filterData(rowIndex) && (
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
    }

    // else
    return <></>
};

const TerminalDataTable2 = ({
    table,
    isOpen,
    onClose,
    onPreviousOffset = null,
    onForwardOffset = null,
    limit = null,
    className = '',
    modalProps = {},
}) => {

    const theme = useStore(state => state.getCurrentTheme());
    const [isExpanded, setExpanded] = useState({});
    const [filters, setFilters] = useState({});
    const [isStateFormat, setIsStateFormat] = useState(false)

    useEffect(() => {
        if (table?.data && table?.columns && table?.count) {
            setIsStateFormat(true)
        } else {
            setIsStateFormat(false)
        }
    }, [table, limit]);


    const handleExpansion = (row, col, expanded) => setExpanded(prev => ({ ...prev, [`${row}-${col}`]: expanded }));
    const handleSearch = (columnKey, value) => setFilters(prev => ({ ...prev, [columnKey]: value.toLowerCase() }));

    // Update the filterData function in the main component to handle both formats
    const filterData = (rowIndex) => {
        return Object.keys(filters).every(columnKey => {
            const filterValue = filters[columnKey];
            if (!filterValue) return true;

            let cellValue;
            if (isStateFormat) {
                cellValue = table?.data[columnKey]?.values[rowIndex];
            } else {
                cellValue = table[rowIndex][columnKey];
            }

            return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
    };

    return (
        <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50" {...modalProps}>
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex items-center justify-center">
                <HeadlessDialog.Panel className={`w-full max-h-[80vh] overflow-y-auto ${theme.bg} ${theme.border} border shadow-lg`}>
                    <div className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto">
                        <table className="w-full">
                            <TableHeader table={table}
                                         onSearch={handleSearch}
                                         isStateFormat={isStateFormat}/>
                            <TableBody
                                table={table}
                                limit={limit}
                                filterData={filterData}
                                isExpanded={isExpanded}
                                onExpand={handleExpansion}
                                isStateFormat={isStateFormat}
                            />
                        </table>
                    </div>
                </HeadlessDialog.Panel>
            </div>
        </HeadlessDialog>
    );
};

export default memo(TerminalDataTable2);
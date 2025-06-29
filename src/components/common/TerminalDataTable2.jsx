// DataTable.jsx
import React, {memo, useEffect, useState} from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import {Search as SearchIcon, ChevronLeft, ChevronRight, PlayIcon} from 'lucide-react';
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

// Helper function to get sorted columns
const getSortedColumns = (table, isStateFormat) => {
    if (isStateFormat && table?.columns) {
        return Object.entries(table.columns).sort(([, columnA], [, columnB]) => {
            const orderA = columnA?.display_order ?? Number.MAX_SAFE_INTEGER;
            const orderB = columnB?.display_order ?? Number.MAX_SAFE_INTEGER;
            
            // Primary sort by display_order
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            
            // Secondary sort by column name (alphabetically)
            const nameA = columnA?.name || '';
            const nameB = columnB?.name || '';
            return nameA.localeCompare(nameB);
        });
    } else if (!isStateFormat && table?.length > 0) {
        const columns = Object.keys(table[0]);
        return columns.map(key => [key, { name: key }]);
    }
    return [];
}

const TableHeader = ({ table, onSearch, isStateFormat }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const sortedColumns = getSortedColumns(table, isStateFormat);

    return (<thead className={`sticky top-0 ${theme.bg} z-10`}>
        <tr>
            <th className={`${theme.datatable.header} ${theme.border}`}>
                <div className="flex flex-col">

                </div>
            </th>
            {sortedColumns.map(([key, column]) => (
                <th key={key} className={`${theme.datatable.header} ${theme.border}`}>
                    <div className="flex flex-col">
                        <div className="flex min-w-[50px]">
                            <div className="text-sm pr-4 uppercase">{column.name}</div>
                            <SearchField placeholder={column.name} columnKey={key} onSearch={onSearch}/>
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

const TableCellTrigger = ({ key, columnKey, rowIndex, table, isStateFormat, onCellTrigger = null }) => {
    const theme = useStore(state => state.getCurrentTheme());
    
    const handleClick = (e) => {
        if (onCellTrigger) {
            // Build row data only when clicked using the sorted columns
            const sortedColumns = getSortedColumns(table, isStateFormat);
            const rowData = sortedColumns.reduce((acc, [colKey]) => {
                acc[colKey] = table.data[colKey]?.values[rowIndex] ?? null;
                return acc;
            }, {});
            
            onCellTrigger(columnKey, rowIndex, rowData);
            
            // Add glow animation to row
            const row = e.currentTarget.closest('tr');
            if (row) {
                row.style.setProperty('--glow-color', theme.glowColor || 'rgb(74, 222, 128)');
                row.style.animation = 'none';
                setTimeout(() => {
                    row.style.animation = 'row-glow 1s ease-out';
                }, 10);
            }
        }
    };
    
    return (
        <td className={`border-r border-dashed ${theme.border} px-2 py-2 ${theme.text}`}>
            <button 
                onClick={handleClick}
                className="group"
            >
                <PlayIcon 
                    className={`w-3 h-3 transition-all duration-200 ${theme.icon} ${theme.hover} group-active:scale-125`} 
                />
            </button>
        </td>
    )
}

const TableBody = ({ table, offset, limit, filterData, isExpanded, onExpand, isStateFormat, onCellTrigger = null}) => {
    const theme = useStore(state => state.getCurrentTheme());

    // handle original state column data row value format
    if (isStateFormat && table?.data) {
        const sortedColumns = getSortedColumns(table, isStateFormat);
        const sortedColumnKeys = sortedColumns.map(([key]) => key);

        return (
            <tbody className="">
            {Array.from({ length: Math.min(limit ?? table.count, table.count) }).map((_, rowIndex) => filterData(rowIndex) && (
                <tr key={rowIndex} className={`border-b border-dashed ${theme.border} hover:${theme.button.primary} transition-all duration-300`}>
                    {/*<TableCell key={`${rowIndex}-action`} value={`${offset + rowIndex + 1}`}*/}
                    {/*    rowIndex={rowIndex}*/}
                    {/*    columnKey={`${rowIndex}-action`}*/}
                    {/*    isExpanded={true}*/}
                    {/*    onExpand={() => {}}*/}
                    {/*/>*/}

                    <TableCellTrigger key={`${rowIndex}-action`}
                                      onCellTrigger={onCellTrigger}
                                      columnKey={`${rowIndex}-action`} rowIndex={rowIndex}
                                      isStateFormat={isStateFormat} table={table} />

                    {sortedColumnKeys.map((columnKey) => (
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
        const sortedColumns = getSortedColumns(table, isStateFormat);
        const sortedColumnKeys = sortedColumns.map(([key]) => key);
        return (
            <tbody>
            {table?.map((row, rowIndex) => filterData(rowIndex) && (
                <tr key={rowIndex} className={`border-b border-dashed ${theme.border} hover:${theme.button.primary} transition-all duration-300`}>
                    {sortedColumnKeys.map((columnKey) => (
                        <TableCell
                            key={columnKey}
                            value={row[columnKey] ?? null}
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

    // else
    return <></>
};

const TerminalDataTable2 = ({
    table,
    isOpen,
    onClose,
    onPreviousOffset = null,
    onForwardOffset = null,
    offset = null,
    limit = null,
    className = '',
    modalProps = {},
    onCellTrigger = null,
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
                <HeadlessDialog.Panel className={`w-full max-h-[80vh] flex flex-col ${theme.bg} ${theme.border} border shadow-lg`}>
                    {(onPreviousOffset || onForwardOffset) && (
                        <div className={`flex min-h-10 h-10 max-h-10 justify-between items-center p-0 border-b border-dashed ${theme.border}`}>
                            <button
                                onClick={() => onPreviousOffset && onPreviousOffset(limit)}
                                disabled={!onPreviousOffset}
                                className={`flex items-center gap-2 px-4 py-2 ${theme.button.secondary}`}
                            >
                                <ChevronLeft className="w-4 h-4" />Previous
                            </button>
                            <span className={`text-sm ${theme.text}`}>
                                Showing {Math.min(limit ?? table.count, table.count)} of {table.count} rows
                            </span>
                            <button
                                onClick={() => onForwardOffset && onForwardOffset(limit)}
                                disabled={!onForwardOffset}
                                className={`flex items-center gap-2 px-4 py-2 ${theme.button.secondary}`}
                            >
                                Next<ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-auto relative">
                        <table className="w-full">
                            <TableHeader table={table}
                                         onSearch={handleSearch}
                                         isStateFormat={isStateFormat}/>
                            <TableBody
                                table={table}
                                offset={offset}
                                limit={limit}
                                filterData={filterData}
                                isExpanded={isExpanded}
                                onExpand={handleExpansion}
                                isStateFormat={isStateFormat}
                                onCellTrigger={onCellTrigger}
                            />
                        </table>
                    </div>
                </HeadlessDialog.Panel>
            </div>
        </HeadlessDialog>
    );
};

export default memo(TerminalDataTable2);
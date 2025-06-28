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

const TableHeader = ({ table, onSearch, isStateFormat }) => {
    const theme = useStore(state => state.getCurrentTheme());
    let columns = {}
    if (isStateFormat) {
        columns = table?.columns
    } else {
        columns = table?.length > 0 ? Object.keys(table[0]) : [];
    }

    return (<thead className={`sticky top-0 ${theme.bg} z-10`}>
        <tr>
            <th className={`${theme.datatable.header} ${theme.border}`}>
                <div className="flex flex-col">

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

const TableCellTrigger = ({ key, columnKey, rowIndex, value, onCellTrigger = null }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [isClicked, setIsClicked] = useState(false);
    
    const handleClick = () => {
        if (onCellTrigger) {
            setIsClicked(true);
            onCellTrigger(columnKey, rowIndex, value);
            
            // Trigger glow effect on the parent row
            const button = document.querySelector(`[data-row-trigger="${rowIndex}"]`);
            if (button) {
                const row = button.closest('tr');
                if (row) {
                    row.classList.add('glow-effect');
                    setTimeout(() => {
                        row.classList.remove('glow-effect');
                    }, 1000);
                }
            }
            
            // Reset clicked state after animation
            setTimeout(() => setIsClicked(false), 300);
        }
    };
    
    return (<>
        <td className={`border-r border-dashed ${theme.border} px-2 py-2 ${theme.text}`}>
            <button 
                data-row-trigger={rowIndex}
                onClick={handleClick}
                className={`transition-all duration-300 ${isClicked ? 'scale-125' : 'scale-100'}`}
            >
                <PlayIcon 
                    className={`w-3 h-3 transition-colors duration-200 ${
                        isClicked 
                            ? 'text-amber-300' 
                            : `${theme.icon} hover:text-amber-300`
                    }`} 
                />
            </button>
        </td>
    </>)
}

const TableBody = ({ table, offset, limit, filterData, isExpanded, onExpand, isStateFormat, onCellTrigger = null}) => {
    const theme = useStore(state => state.getCurrentTheme());

    // handle original state column data row value format
    if (isStateFormat && table?.data) {
        return (
            <tbody className="">
            {Array.from({ length: Math.min(limit ?? table.count, table.count) }).map((_, rowIndex) => filterData(rowIndex) && (
                <tr key={rowIndex} className={`border-b border-dashed ${theme.border} hover:${theme.button.primary}`}>
                    {/*<TableCell key={`${rowIndex}-action`} value={`${offset + rowIndex + 1}`}*/}
                    {/*    rowIndex={rowIndex}*/}
                    {/*    columnKey={`${rowIndex}-action`}*/}
                    {/*    isExpanded={true}*/}
                    {/*    onExpand={() => {}}*/}
                    {/*/>*/}

                    <TableCellTrigger key={`${rowIndex}-action`}
                                      onCellTrigger={onCellTrigger}
                                      columnKey={`${rowIndex}-action`} rowIndex={rowIndex}
                                      value={Object.keys(table.columns).reduce((acc, columnKey) => {
                        acc[columnKey] = table.data[columnKey]?.values[rowIndex] ?? null;
                        return acc;
                    }, {})} />

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
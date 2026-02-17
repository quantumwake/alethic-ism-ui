// DataTable.jsx
import React, {memo, useEffect, useState, useMemo} from 'react';
import { Dialog as HeadlessDialog, DialogPanel as HeadlessDialogPanel } from '@headlessui/react';
import {Search as SearchIcon, ChevronLeft, ChevronRight, ChevronDown, PlayIcon, Columns3} from 'lucide-react';
import TerminalInput from './TerminalInput';
import TerminalTagField from './TerminalTagField';
import {useStore} from "../../store";

const JsonTreeEntry = ({ keyName, value, isArrayIndex, theme }) => {
    const [expanded, setExpanded] = useState(false);
    const isComplex = value !== null && typeof value === 'object';

    const keyLabel = isArrayIndex ? `${keyName}` : `"${keyName}"`;
    const keyClass = isArrayIndex ? theme.textMuted : theme.textAccent;
    const valueClass = value === null ? theme.textMuted : theme.textAccent;

    // Collapsed
    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className={`flex items-center hover:${theme.textAccent}`}
            >
                <ChevronRight className="w-3 h-3" />
                <span className={keyClass}>{keyLabel}</span>
            </button>
        );
    }

    // Expanded - primitive
    if (!isComplex) {
        return (
            <div>
                <button
                    onClick={() => setExpanded(false)}
                    className={`flex items-center hover:${theme.textAccent}`}
                >
                    <ChevronDown className="w-3 h-3" />
                    <span className={keyClass}>{keyLabel}</span>
                </button>
                <div className={`ml-4 border-l border-dashed ${theme.border} pl-2`}>
                    <span className={valueClass}>{JSON.stringify(value)}</span>
                </div>
            </div>
        );
    }

    // Expanded - complex
    const isArray = Array.isArray(value);
    const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);

    return (
        <div>
            <button
                onClick={() => setExpanded(false)}
                className={`flex items-center hover:${theme.textAccent}`}
            >
                <ChevronDown className="w-3 h-3" />
                <span className={keyClass}>{keyLabel}</span>
            </button>
            <div className={`ml-4 border-l border-dashed ${theme.border} pl-2`}>
                {entries.map(([key, val]) => (
                    <JsonTreeEntry
                        key={key}
                        keyName={key}
                        value={val}
                        isArrayIndex={isArray}
                        theme={theme}
                    />
                ))}
            </div>
        </div>
    );
};

const JsonTreeView = ({ data }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [expanded, setExpanded] = useState(false);

    // Primitive at root level
    if (data === null || typeof data !== 'object') {
        const valueClass = data === null ? theme.textMuted : theme.textAccent;
        return <span className={valueClass}>{JSON.stringify(data)}</span>;
    }

    // Complex value at root
    const isArray = Array.isArray(data);
    const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
    const brackets = isArray ? ['[', ']'] : ['{', '}'];
    const summary = isArray ? `Array(${data.length})` : `Object(${Object.keys(data).length})`;

    if (entries.length === 0) {
        return <span className={theme.textMuted}>{brackets[0]}{brackets[1]}</span>;
    }

    return (
        <span>
            <button
                onClick={() => setExpanded(!expanded)}
                className={`inline-flex items-center hover:${theme.textAccent}`}
            >
                {expanded
                    ? <ChevronDown className="w-3 h-3" />
                    : <ChevronRight className="w-3 h-3" />
                }
                <span className={theme.textMuted}>{brackets[0]}</span>
                {!expanded && <span className={`${theme.textMuted} text-xs ml-1`}>{summary}</span>}
                {!expanded && <span className={theme.textMuted}>{brackets[1]}</span>}
            </button>
            {expanded && (
                <div className={`ml-4 border-l border-dashed ${theme.border} pl-2`}>
                    {entries.map(([key, value]) => (
                        <JsonTreeEntry
                            key={key}
                            keyName={key}
                            value={value}
                            isArrayIndex={isArray}
                            theme={theme}
                        />
                    ))}
                </div>
            )}
            {expanded && <span className={theme.textMuted}>{brackets[1]}</span>}
        </span>
    );
};

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

// Page Size Selector
const PageSizeSelector = ({ value, onChange }) => {
    const options = [25, 50, 100, 250, 500];

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-midnight-text-muted">Page size:</span>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="bg-midnight-surface border border-midnight-border text-midnight-text-body text-sm px-2 py-1 outline-none focus:border-midnight-accent"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
};

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

const TableHeader = ({ table, onSearch, isStateFormat, selectedColumns = [], getVisibleColumns }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const allColumns = getSortedColumns(table, isStateFormat);
    const visibleColumns = getVisibleColumns ? getVisibleColumns(allColumns) : allColumns;

    return (<thead className={`sticky top-0 bg-midnight-elevated z-10`}>
        <tr>
            <th className={`${theme.datatable.header} ${theme.border} w-10`}>
            </th>
            {visibleColumns.map(([key, column]) => (
                <th key={key} className={`${theme.datatable.header} ${theme.border}`}>
                    <div className="min-w-[100px]">
                        <SearchField placeholder={column.name} columnKey={key} onSearch={onSearch}/>
                    </div>
                </th>
            ))}
        </tr>
    </thead>)
}

const TableCell = ({value, rowIndex, columnKey, isExpanded, onExpand}) => {
    const theme = useStore(state => state.getCurrentTheme());

    const isComplexType = value !== null && typeof value === 'object';
    const expanded = isExpanded[`${rowIndex}-${columnKey}`];

    // For complex types (objects/arrays), use JsonTreeView
    if (isComplexType) {
        return (
            <td className={`border-r border-dashed ${theme.border} px-2 py-2 ${theme.text}`}>
                <JsonTreeView data={value} defaultExpanded={false} />
            </td>
        );
    }

    // For primitive types, keep truncation logic for long strings
    const displayLength = typeof value === 'string' ? value.length : 0;
    const needsTruncation = displayLength > 80;

    const displayValue = () => {
        if (value === null || value === undefined) return String(value);
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            return expanded ? value : value.slice(0, 80);
        }
        return value;
    }

    return (
        <td className={`border-r border-dashed ${theme.border} px-2 py-2 ${theme.text}`}>
            {(!needsTruncation || expanded)
                ? displayValue()
                : (<>{displayValue()}{' '}
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

const TableBody = ({ table, offset, limit, filterData, isExpanded, onExpand, isStateFormat, onCellTrigger = null, selectedColumns = [], getVisibleColumns}) => {
    const theme = useStore(state => state.getCurrentTheme());

    // handle original state column data row value format
    if (isStateFormat && table?.data) {
        const allColumns = getSortedColumns(table, isStateFormat);
        const visibleColumns = getVisibleColumns ? getVisibleColumns(allColumns) : allColumns;
        const sortedColumnKeys = visibleColumns.map(([key]) => key);

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
        const allColumns = getSortedColumns(table, isStateFormat);
        const visibleColumns = getVisibleColumns ? getVisibleColumns(allColumns) : allColumns;
        const sortedColumnKeys = visibleColumns.map(([key]) => key);
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
    limit: initialLimit = 100,
    className = '',
    modalProps = {},
    onCellTrigger = null,
    onLimitChange = null,
}) => {

    const theme = useStore(state => state.getCurrentTheme());
    const [isExpanded, setExpanded] = useState({});
    const [filters, setFilters] = useState({});
    const [isStateFormat, setIsStateFormat] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [pageSize, setPageSize] = useState(initialLimit);

    useEffect(() => {
        if (table?.data && table?.columns && table?.count) {
            setIsStateFormat(true)
        } else {
            setIsStateFormat(false)
        }
    }, [table]);

    // Get all available column names
    const availableColumns = useMemo(() => {
        if (isStateFormat && table?.columns) {
            return Object.entries(table.columns).map(([key, col]) => col.name || key);
        } else if (!isStateFormat && table?.length > 0) {
            return Object.keys(table[0]);
        }
        return [];
    }, [table, isStateFormat]);

    // Handle page size change
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        if (onLimitChange) {
            onLimitChange(newSize);
        }
    };

    // Filter columns based on selection
    const getVisibleColumns = (allColumns) => {
        if (selectedColumns.length === 0) {
            return allColumns; // Show all when none selected
        }
        return allColumns.filter(([key, col]) => {
            const colName = col.name || key;
            return selectedColumns.includes(colName);
        });
    };

    const limit = pageSize;


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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <HeadlessDialogPanel className={`
                    w-full max-w-6xl max-h-[85vh] flex flex-col
                    bg-midnight-surface border border-midnight-border
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                    overflow-hidden
                `}>
                    {/* Column selector and page size controls */}
                    <div className="flex items-center gap-4 px-4 py-2 bg-midnight-elevated border-b border-midnight-border">
                        <TerminalTagField
                            availableOptions={availableColumns}
                            selectedTags={selectedColumns}
                            onTagsChange={setSelectedColumns}
                            placeholder="Type to filter columns..."
                            icon={<Columns3 className="w-4 h-4 text-midnight-text-muted ml-1" />}
                            className="flex-1"
                        />
                        <PageSizeSelector value={pageSize} onChange={handlePageSizeChange} />
                    </div>

                    {/* Pagination controls */}
                    {(onPreviousOffset || onForwardOffset) && (
                        <div className="flex h-10 justify-between items-center px-4 bg-midnight-surface border-b border-midnight-border">
                            <button
                                onClick={() => onPreviousOffset && onPreviousOffset(limit)}
                                disabled={!onPreviousOffset}
                                className="flex items-center gap-2 px-3 py-1 text-sm
                                    bg-midnight-surface hover:bg-midnight-raised
                                    border border-midnight-border
                                    text-midnight-text-body disabled:opacity-40 disabled:cursor-not-allowed
                                    transition-all duration-200"
                            >
                                <ChevronLeft className="w-4 h-4" />Previous
                            </button>
                            <span className="text-sm text-midnight-text-muted">
                                Showing {Math.min(limit ?? table.count, table.count)} of {table.count} rows
                                {selectedColumns.length > 0 && ` | ${selectedColumns.length} columns selected`}
                            </span>
                            <button
                                onClick={() => onForwardOffset && onForwardOffset(limit)}
                                disabled={!onForwardOffset}
                                className="flex items-center gap-2 px-3 py-1 text-sm
                                    bg-midnight-surface hover:bg-midnight-raised
                                    border border-midnight-border
                                    text-midnight-text-body disabled:opacity-40 disabled:cursor-not-allowed
                                    transition-all duration-200"
                            >
                                Next<ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-auto relative">
                        <table className={`w-full ${theme.font}`}>
                            <TableHeader table={table}
                                         onSearch={handleSearch}
                                         isStateFormat={isStateFormat}
                                         selectedColumns={selectedColumns}
                                         getVisibleColumns={getVisibleColumns}/>
                            <TableBody
                                table={table}
                                offset={offset}
                                limit={limit}
                                filterData={filterData}
                                isExpanded={isExpanded}
                                onExpand={handleExpansion}
                                isStateFormat={isStateFormat}
                                onCellTrigger={onCellTrigger}
                                selectedColumns={selectedColumns}
                                getVisibleColumns={getVisibleColumns}
                            />
                        </table>
                    </div>
                </HeadlessDialogPanel>
            </div>
        </HeadlessDialog>
    );
};

export default memo(TerminalDataTable2);
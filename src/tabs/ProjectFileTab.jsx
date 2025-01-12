import React, {useEffect, useRef, useState} from 'react';
import {useStore} from '../store';
import {
    Coffee, CopyIcon,
    Database,
    File,
    FileCode,
    FileJson,
    FileText,
    Folder,
    Image,
    PencilIcon,
    TrashIcon,
    User
} from 'lucide-react';
import {PlusIcon} from "@heroicons/react/24/outline";
import TerminalContextMenu from "../components/common/TerminalContextMenu";

export const ProjectFileTab = ({}) => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        setSelectedFile,
        setCurrentWorkspace,
        selectedProjectId,
        projectFiles,
        fetchProjectFiles
    } = useStore()

    const [selectedItem, setSelectedItem] = useState(null)
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [contextMenuItems, setContextMenuItems] = useState([])

    useEffect(() => {
        fetchProjectFiles().then(() => {
            console.log(`finished loading project files: ${selectedProjectId}`)
        })
    }, [selectedProjectId]);

    const getFileIcon = (file) => {
        const format = file.format
        if (format) {
            if (format === "mako") return Coffee
            else if (format === "python") return FileCode
            else if (format === "basic") return FileText
        }

        const filename = file.filename
        if (!filename) {
            return File
        }

        if (filename.endsWith('.js') || filename.endsWith('.jsx')) return FileCode;
        if (filename.endsWith('.json')) return FileJson;
        if (filename.endsWith('.md')) return FileText;
        if (filename.endsWith('.jpg') || filename.endsWith('.png')) return Image;
        if (filename.endsWith('.sql')) return Database;
        if (filename.endsWith('.java')) return Coffee;

        return File;
    };

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        })
    }

    const onItemClick = (item) => {
        if (item.type === "file") {
            setSelectedFile(item)
            setCurrentWorkspace("editor")
        }
    }

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        // Get the mouse coordinates from the event
        const clickX = e.clientX;
        const clickY = e.clientY;

        setContextMenuPosition({ x: clickX, y: clickY });
        setIsOpen(true);
    };

    const handleClick = (item) => {
        if (item.type === 'directory') {
            toggleFolder(item.id);
        } else {
            onItemClick?.(item);
        }

        setSelectedItem(item)
    }

    // update context menus based on selected item
    useEffect(() => {
        if (!selectedItem) {
            return
        }

        let options = []
        if (selectedItem.type === "directory") {
            options.push({
                id: 'new',
                label: 'New File',
                icon: PlusIcon
            })
        } else if (selectedItem.type === "file") {
            options.push(
                {
                    id: 'rename',
                    label: 'Rename',
                    icon: PencilIcon,
                },
                {
                    id: 'delete',
                    label: 'Delete',
                    icon: TrashIcon,
                    danger: true
                },
                {
                    id: 'clone',
                    label: 'Clone',
                    icon: CopyIcon
                }
            )
        }

        setContextMenuItems(options)
    }, [selectedItem]);

    const handleItemClick = (item) => {
        console.debug(`item: ${item}`)
        switch (item.id) {
            case "new":

                break
        }
    }

    const renderItem = (item, depth = 0, skipRoot = false) => {
        if (skipRoot && depth === 0) {
            return item.children?.map(child => renderItem(child, depth + 1, skipRoot));
        }

        const Icon = item.type === 'directory' ? Folder : getFileIcon(item);
        const isExpanded = expandedFolders.has(item.id);

        const isSelected = item?.id === selectedItem?.id ? theme.files.select : ""

        return (
            <div key={item.id}>
                <button
                    onClick={() => handleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}  // Add this line
                    className={`w-full py-1.5 ${theme.hover} flex items-center gap-2 ${isSelected}`}
                    style={{ paddingLeft: `${(depth) * 0.50}rem` }}>

                    <span className={theme.textAccent}>
                        {item.type === 'directory' ? (isExpanded ? '-' : '+') : ' '}
                    </span>

                    <Icon className={`min-w-4 min-h-4 w-4 h-4 ${theme.icon}`} />
                    <span className={`min-h-4 ${theme.text} overflow-visible `}>
                        {(item.name.length <= 30)
                            ? item.name
                            : `${item.name.slice(0, 30)}...`}
                    </span>
                </button>

                {item.type === 'directory' && isExpanded && item.children?.map(child =>
                    renderItem(child, depth + 1)
                )}
            </div>

        );
    };

    return (
        <div className="space-y-0 mt-2 w-full">
            {projectFiles && projectFiles.map(item => renderItem(item, 0, true))}

            <TerminalContextMenu menuRef={menuRef} isOpen={isOpen} setIsOpen={setIsOpen} menuItems={contextMenuItems}
                onItemClick={handleItemClick} menuPosition={contextMenuPosition}
            />
        </div>
    );
};

export default ProjectFileTab;
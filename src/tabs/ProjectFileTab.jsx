import React, {useEffect, useMemo, useRef, useState} from 'react';
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
    Upload,
    User
} from 'lucide-react';
import {PlusIcon} from "@heroicons/react/24/outline";
import TerminalContextMenu from "../components/common/TerminalContextMenu";
import TerminalNewFileDialog from "../components/ism/TerminalNewFileDialog";
import TerminalFileRenameDialog from "../components/ism/TerminalFileRenameDialog";
import {TerminalDialogConfirmation} from "../components/common/TerminalDialogConfirmation";
import {TerminalSearchBar} from "../components/common/TerminalSearchBar";
import {FileTemplate, Directory} from "../store/model";
import {TerminalDialog, TerminalButton} from "../components/common";
import TerminalFileUpload from "../components/common/TerminalFileUpload";

export const ProjectFileTab = ({}) => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        setSelectedFile,
        setCurrentWorkspace,
        selectedProjectId,
        projectFiles,
        fetchProjectFiles,
        saveFile,
        deleteFile,
        addMessage
    } = useStore()

    const [selectedItem, setSelectedItem] = useState(null)
    const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [contextMenuItems, setContextMenuItems] = useState([])
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
    const contextMenuRef = useRef(null)

    // used to display the create new file dialog
    const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
    const [isFileRenameDialogOpen, setIsFileRenameDialogOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)

    useEffect(() => {
        fetchProjectFiles().then(() => {
            console.log(`finished loading project files: ${selectedProjectId}`)
        })
    }, [selectedProjectId]);

    const filterTree = (items, query) => {
        if (!items || !query) return items
        const lowerQuery = query.toLowerCase()

        return items.reduce((acc, item) => {
            if (item.type === 'directory') {
                const filteredChildren = filterTree(item.children, query)
                if (filteredChildren && filteredChildren.length > 0) {
                    acc.push(new Directory(item.id, item.name, filteredChildren))
                }
            } else {
                if (item.name.toLowerCase().includes(lowerQuery)) {
                    acc.push(item)
                }
            }
            return acc
        }, [])
    }

    const filteredProjectFiles = useMemo(() => {
        if (!searchQuery) return projectFiles
        return filterTree(projectFiles, searchQuery)
    }, [projectFiles, searchQuery])

    const getFileIcon = (file) => {
        const format = file.format
        if (format) {
            if (format === "mako") return Coffee
            else if (format === "python") return FileCode
            else if (format === "basic") return FileText
            else if (format === "lua") return FileCode
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

        const clickX = e.clientX;
        const clickY = e.clientY;

        setContextMenuPosition({ x: clickX, y: clickY });
        setIsContextMenuOpen(true);
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
            options.push(
                {
                    id: 'new',
                    label: 'New File',
                    icon: PlusIcon
                },
                {
                    id: 'upload',
                    label: 'Upload File',
                    icon: Upload
                }
            )
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
                toggleNewFileDialog()
                break
            case "rename":
                toggleFileRenameDialog()
                break
            case "delete":
                setIsDeleteConfirmOpen(true)
                break
            case "clone":
                handleCloneFile()
                break
            case "upload":
                setIsUploadDialogOpen(true)
                break
        }
    }

    const handleCloneFile = async () => {
        if (!selectedItem || selectedItem.type !== 'file') return

        const clonedFile = new FileTemplate({
            template_path: `${selectedItem.name}_copy`,
            template_type: selectedItem.format,
            template_content: selectedItem.content || ""
        })

        try {
            await saveFile(clonedFile)
            addMessage({ level: 'success', heading: 'Clone', body: `Cloned "${selectedItem.name}" as "${selectedItem.name}_copy"` })
        } catch (error) {
            addMessage({ level: 'error', heading: 'Clone Failed', body: error.message || 'Failed to clone file' })
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return

        try {
            const success = await deleteFile(selectedItem)
            if (success) {
                addMessage({ level: 'success', heading: 'Deleted', body: `Deleted "${selectedItem.name}"` })
                setSelectedItem(null)
            } else {
                addMessage({ level: 'error', heading: 'Delete Failed', body: `Failed to delete "${selectedItem.name}"` })
            }
        } catch (error) {
            addMessage({ level: 'error', heading: 'Delete Failed', body: error.message || 'Failed to delete file' })
        }
    }

    const handleUploadFile = (file) => {
        setUploadedFile(file)
    }

    const handleUploadConfirm = async () => {
        if (!uploadedFile || !selectedItem) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            const content = e.target.result
            const templateType = selectedItem.id // directory id is the template type

            const newFile = new FileTemplate({
                template_path: uploadedFile.name,
                template_type: templateType,
                template_content: content
            })

            try {
                await saveFile(newFile)
                addMessage({ level: 'success', heading: 'Uploaded', body: `Uploaded "${uploadedFile.name}"` })
            } catch (error) {
                addMessage({ level: 'error', heading: 'Upload Failed', body: error.message || 'Failed to upload file' })
            }

            setIsUploadDialogOpen(false)
            setUploadedFile(null)
        }
        reader.readAsText(uploadedFile)
    }

    const toggleNewFileDialog = () => {
        setIsNewFileDialogOpen(prevState => !prevState)
    }

    const toggleFileRenameDialog = () => {
        setIsFileRenameDialogOpen(prevState => !prevState)
    }

    const renderItem = (item, depth = 0, skipRoot = false) => {
        if (skipRoot && depth === 0) {
            return item.children?.map(child => renderItem(child, depth + 1, skipRoot));
        }

        const Icon = item.type === 'directory' ? Folder : getFileIcon(item);
        const isExpanded = expandedFolders.has(item.id) || (searchQuery && item.type === 'directory');

        const isSelected = item?.id === selectedItem?.id ? theme.files.select : ""

        return (
            <div key={item.id}>
                <button
                    onClick={() => handleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
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
            <div className="px-1 pb-2">
                <TerminalSearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredProjectFiles && filteredProjectFiles.map(item => renderItem(item, 0, true))}

            <TerminalContextMenu menuRef={contextMenuRef} isOpen={isContextMenuOpen} setIsOpen={setIsContextMenuOpen} menuItems={contextMenuItems}
                onItemClick={handleItemClick} menuPosition={contextMenuPosition}
            />

            <TerminalNewFileDialog isOpen={isNewFileDialogOpen} setIsOpen={setIsNewFileDialogOpen} />
            <TerminalFileRenameDialog isOpen={isFileRenameDialogOpen} setIsOpen={setIsFileRenameDialogOpen} />

            <TerminalDialogConfirmation
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                title="DELETE FILE"
                content={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                onAccept={handleDeleteConfirm}
            />

            <TerminalDialog isOpen={isUploadDialogOpen} onClose={() => { setIsUploadDialogOpen(false); setUploadedFile(null); }} title="UPLOAD FILE">
                <div className="space-y-4">
                    <TerminalFileUpload
                        accept="*"
                        onChange={handleUploadFile}
                    />
                    <div className="flex justify-end gap-2">
                        <TerminalButton variant="primary" onClick={() => { setIsUploadDialogOpen(false); setUploadedFile(null); }}>Cancel</TerminalButton>
                        <TerminalButton variant="primary" onClick={handleUploadConfirm} disabled={!uploadedFile}>Upload</TerminalButton>
                    </div>
                </div>
            </TerminalDialog>
        </div>
    );
};

export default ProjectFileTab;

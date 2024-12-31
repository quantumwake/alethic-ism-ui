import React, {useEffect, useState} from 'react';
import {useStore} from '../store';
import {
    File,
    FileText,
    FileCode,
    FileJson,
    Folder,
    Image,
    Database,
    Coffee,
    Play
} from 'lucide-react';

export const ProjectFileTab = ({}) => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        currentWorkspace,
        setCurrentWorkspace,
        selectedProjectId,
        projectFileSystem,
        fetchProjectFileSystem
    } = useStore()

    const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));
    // const [files, setFiles] = useState([])

    useEffect(() => {
        fetchProjectFileSystem(selectedProjectId).then(() => {
            console.log(`finished loading project files: ${selectedProjectId}`)
        })
    }, [selectedProjectId]);

    const getFileIcon = (filename) => {
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
        console.debug(item)
        if (item.callbackFn) {

            // item.callbackFn(item)
        }
        setCurrentWorkspace("editor")
    }

    const renderItem = (item, depth = 0) => {
        const Icon = item.type === 'folder' ? item.icon : getFileIcon(item.label);
        const isExpanded = expandedFolders.has(item.id);

        return (
            <div key={item.id}>
                <button
                    onClick={() => {
                        if (item.type === 'folder') {
                            toggleFolder(item.id);
                        } else {
                            onItemClick?.(item);
                        }
                    }}
                    className={`w-full text-left px-2 py-1 ${theme.hover} flex items-center gap-2`}
                    style={{ paddingLeft: `${(depth + 1) * 0.75}rem` }}>
                  <span className={theme.textAccent}>
                    {item.type === 'folder' ? (isExpanded ? '▼' : '▶') : '>'}
                  </span>

                    <Icon className={`w-3 h-3 ${theme.icon}`} />
                    <span className={`text-xs ${theme.text}`}>{item.label}</span>
                    {item.type === 'file' && (
                        <Play className={`w-3 h-3 ${theme.icon} ml-auto opacity-0 group-hover:opacity-100`} />
                    )}
                </button>

                {item.type === 'folder' && isExpanded && item.children?.map(child =>
                    renderItem(child, depth + 1)
                )}
            </div>
        );
    };

    return (
        <div className="space-y-0">
            {projectFileSystem && projectFileSystem.map(item => renderItem(item))}
        </div>
    );
};

export default ProjectFileTab;
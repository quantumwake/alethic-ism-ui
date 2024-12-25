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


const tempFunc = (name, label, templates) => {
    const filtered = templates.filter(t => t.template_type === name)
    if (!filtered) {
        return []
    }

    const children = filtered.map((t) => {
        return {
            id: t.template_id,
            label: t.template_path,
            icon: FileCode,
            type: 'file'
        }
    })

    return { id: name, label: label, icon: Folder, type: 'folder',  children: children }
}

export const ProjectFileTab = ({}) => {
    const theme = useStore(state => state.getCurrentTheme());
    const {currentWorkspace, setCurrentWorkspace} = useStore()
    const {templates, createTemplate, selectedProjectId} = useStore();
    const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));
    const [files, setFiles] = useState([])

    useEffect(() => {
        // TODO temporary hack
        let temp = [{
                id: 'src',
                label: 'src',
                icon: Folder,
                type: 'folder',
                children: [
                    tempFunc("basic", "Basic", templates),
                    tempFunc("mako", "Mako", templates),
                    tempFunc("python", "Python", templates),
                    tempFunc("golang", "Go", templates),
                    tempFunc("sql", "SQL", templates)
                ]
            },
            // { id: 'package.json', label: 'package.json', icon: FileJson, type: 'file' },
            { id: 'README.md', label: 'README.md', icon: FileText, type: 'file' }
        ]

        setFiles(temp)

    }, [templates]);


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
            {files.map(item => renderItem(item))}
        </div>
    );
};

export default ProjectFileTab;
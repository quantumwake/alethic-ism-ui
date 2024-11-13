import React, { useState } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faChevronRight} from "@fortawesome/free-solid-svg-icons";

// Recursive component to render each node and its children
const CustomTreeViewNode = ({node, onClick, isRoot = false}) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div key={node.id}>
            <div
                className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-100 transition-all duration-200"
                onClick={() => {
                    setIsOpen(!isOpen);
                    onClick(node); // Call the provided callback on click
                }}>

                {hasChildren && (
                    <span className="text-gray-500">
                        {isOpen ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} /> }
                    </span>
                )}
                <span className="text-gray-800 font-medium">{node.name}</span>
            </div>

            {/* Render children if open */}
            {hasChildren && isOpen && (
                <div className="border-l border-gray-200 pl-2">
                    {node.children.map((childNode) => (
                        <CustomTreeViewNode node={childNode} onClick={onClick}/>
                    ))}
                </div>
            )}
        </div>
    );
};

const CustomTreeView = ({rootNode, onClick}) => {
    // Render root node with its children
    return <div className="border-2 border-blue">
        {rootNode && rootNode.length > 0 && (
        <CustomTreeViewNode node={rootNode.children[0]} onClick={onClick} isRoot={true}/>
        )}
    </div>
};

export default CustomTreeView;

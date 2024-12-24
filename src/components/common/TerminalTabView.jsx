import React, {useState} from "react";
import useStore from '../../store';
import TerminalCategoryItem from "./TerminalCategoryItem";
import TerminalCategorySection from "./TerminalCategorySection";
import TerminalSearchBar from "./TerminalSearchBar";

export const TerminalTabView = ({ sections }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className={`flex flex-col h-full ${theme.bg}`}>
            <div className={`p-1.5 border-b ${theme.border}`}>
                <TerminalSearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto">
                {sections.map((section, index) => (
                    <TerminalCategorySection
                        key={index}
                        title={section.title}
                        defaultCollapsed={section.defaultCollapsed}
                    >
                        {section.items
                            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((item, itemIndex) => (
                                <TerminalCategoryItem
                                    key={itemIndex}
                                    {...item}
                                />
                            ))
                        }
                    </TerminalCategorySection>
                ))}
            </div>
        </div>
    );
};

export default TerminalTabView
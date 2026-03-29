import React from 'react';
import { useStore } from '../../../store';
import {
    TerminalLabel,
    TerminalDropdown,
    TerminalToggle,
    TerminalTabViewSection,
    TerminalTagField,
} from '../../../components/common';

/**
 * Reusable StateProperties sections (Execution, Routing, Persistence, Inheritance, Output).
 *
 * Reads/writes `nodeData.properties` for the given nodeId via the store.
 * Used by both StatePropertyTab (regular states) and ProcessorFileSourceConfig (embedded states).
 *
 * @param {string} nodeId - The state node ID whose properties to render
 * @param {string} [stateType] - Override state_type for conditional fields (defaults to nodeData.state_type)
 */
const StatePropertiesSections = ({ nodeId, stateType }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const setNodeData = useStore(state => state.setNodeData);

    const resolvedType = stateType || nodeData?.state_type;

    const onChangeProperty = (path, value) => {
        const properties = { ...(nodeData?.properties || {}) };
        const parts = path.split('.');
        if (parts.length === 2) {
            const [group, field] = parts;
            if (!properties[group]) properties[group] = {};
            properties[group] = { ...properties[group], [field]: value };
        } else {
            properties[path] = value;
        }
        setNodeData(nodeId, { ...nodeData, properties });
    };

    const getProperty = (path, defaultValue = null) => {
        const parts = path.split('.');
        if (parts.length === 2) {
            const [group, field] = parts;
            return nodeData?.properties?.[group]?.[field] ?? defaultValue;
        }
        return nodeData?.properties?.[path] ?? defaultValue;
    };

    // ─── Section builders ────────────────────────────────────────────

    const executionSection = () => ({
        title: "Execution",
        content: (
            <div className={theme.spacing.base}>
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-col space-y-1">
                        <TerminalLabel description="How data is processed: individually, in batch, or as a stream">
                            Strategy
                        </TerminalLabel>
                        <TerminalDropdown
                            values={[
                                { id: 'individual', label: 'Individual' },
                                { id: 'batch', label: 'Batch' },
                                { id: 'stream', label: 'Stream' },
                            ]}
                            onSelect={(v) => onChangeProperty('execution.strategy', v.id)}
                            defaultValue={getProperty('execution.strategy', 'individual')}
                            placeholder="Execution strategy"
                        />
                    </div>
                    {/* inherit_set removed — batch input always stored as inherited_batch_data column,
                       serialization controlled by persistence.flatten */}
                </div>
            </div>
        )
    });

    const routingSection = () => {
        const mode = getProperty('routing.mode', 'disabled');
        return {
            title: "Routing",
            content: (
                <div className={theme.spacing.base}>
                    <div className="flex flex-col space-y-3">
                        <div className="flex flex-col space-y-1">
                            <TerminalLabel description="When to route output downstream">
                                Mode
                            </TerminalLabel>
                            <TerminalDropdown
                                values={[
                                    { id: 'disabled', label: 'Disabled' },
                                    { id: 'immediate', label: 'Immediate' },
                                    { id: 'after_save', label: 'After Save' },
                                ]}
                                onSelect={(v) => onChangeProperty('routing.mode', v.id)}
                                defaultValue={mode}
                                placeholder="Routing mode"
                            />
                        </div>
                        {mode !== 'disabled' && (
                            <div className="flex flex-col space-y-1">
                                <TerminalLabel description="How rows are dispatched downstream">
                                    Dispatch
                                </TerminalLabel>
                                <TerminalDropdown
                                    values={[
                                        { id: 'batch', label: 'Batch' },
                                        { id: 'individual', label: 'Individual' },
                                    ]}
                                    onSelect={(v) => onChangeProperty('routing.dispatch', v.id)}
                                    defaultValue={getProperty('routing.dispatch', 'batch')}
                                    placeholder="Dispatch mode"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )
        };
    };

    const persistenceSection = () => {
        const mode = getProperty('persistence.mode', 'disabled');
        return {
            title: "Persistence",
            content: (
                <div className={theme.spacing.base}>
                    <div className="flex flex-col space-y-3">
                        <div className="flex flex-col space-y-1">
                            <TerminalLabel description="How output data is persisted to storage">
                                Mode
                            </TerminalLabel>
                            <TerminalDropdown
                                values={[
                                    { id: 'disabled', label: 'Disabled' },
                                    { id: 'individual_rows', label: 'Individual Rows' },
                                    { id: 'json_column', label: 'JSON Column' },
                                    { id: 'list_columns', label: 'List Columns' },
                                ]}
                                onSelect={(v) => onChangeProperty('persistence.mode', v.id)}
                                defaultValue={mode}
                                placeholder="Persistence mode"
                            />
                        </div>
                        {mode !== 'disabled' && (
                            <div className="flex flex-col space-y-1">
                                <TerminalLabel description="How nested values are flattened before save">
                                    Flatten
                                </TerminalLabel>
                                <TerminalDropdown
                                    values={[
                                        { id: 'dot_notation', label: 'Dot Notation' },
                                        { id: 'json_string', label: 'JSON String' },
                                        { id: 'none', label: 'None' },
                                    ]}
                                    onSelect={(v) => onChangeProperty('persistence.flatten', v.id)}
                                    defaultValue={getProperty('persistence.flatten', 'dot_notation')}
                                    placeholder="Flatten mode"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )
        };
    };

    const inheritanceSection = () => ({
        title: "Inheritance",
        content: (
            <div className={theme.spacing.base}>
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-col space-y-1">
                        <TerminalLabel description="Which input columns are inherited by the output">
                            Mode
                        </TerminalLabel>
                        <TerminalDropdown
                            values={[
                                { id: 'all', label: 'All' },
                                { id: 'selective', label: 'Selective' },
                                { id: 'inverse', label: 'Inverse' },
                            ]}
                            onSelect={(v) => onChangeProperty('inheritance.mode', v.id)}
                            defaultValue={getProperty('inheritance.mode', 'all')}
                            placeholder="Inheritance mode"
                        />
                    </div>
                    <div className={`flex items-center ${theme.spacing.sm}`}>
                        <span className={theme.text}>Require Primary Key</span>
                        <TerminalToggle
                            checked={getProperty('inheritance.require_primary_key', false)}
                            onChange={(checked) => onChangeProperty('inheritance.require_primary_key', checked)}
                        />
                    </div>
                </div>
            </div>
        )
    });

    const outputSection = () => ({
        title: "Output",
        content: (
            <div className={theme.spacing.base}>
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-col space-y-1">
                        <TerminalLabel description="Extra fields added to each output row">
                            Enrichments
                        </TerminalLabel>
                        <TerminalTagField
                            availableOptions={['raw_output', 'provider', 'created_at', 'prompts']}
                            selectedTags={getProperty('output.enrichments', ['raw_output', 'provider', 'created_at']) || []}
                            onTagsChange={(tags) => onChangeProperty('output.enrichments', tags)}
                            placeholder="Add enrichment..."
                        />
                    </div>
                    <div className={`flex items-center ${theme.spacing.sm}`}>
                        <span className={theme.text}>Dedup Enabled</span>
                        <TerminalToggle
                            checked={getProperty('dedup_enabled', false)}
                            onChange={(checked) => onChangeProperty('dedup_enabled', checked)}
                        />
                    </div>
                    <div className={`flex items-center ${theme.spacing.sm}`}>
                        <span className={theme.text}>Append to Session</span>
                        <TerminalToggle
                            checked={getProperty('append_to_session', false)}
                            onChange={(checked) => onChangeProperty('append_to_session', checked)}
                        />
                    </div>
                </div>
            </div>
        )
    });

    // ─── Render all sections ─────────────────────────────────────────

    const sections = {
        execution: { title: "Execution", items: { content: executionSection() } },
        routing: { title: "Routing", items: { content: routingSection() } },
        persistence: { title: "Persistence", items: { content: persistenceSection() } },
        inheritance: { title: "Inheritance", items: { content: inheritanceSection() } },
        output: { title: "Output", items: { content: outputSection() } },
    };

    return (
        <>
            {Object.entries(sections).map(([key, section]) => (
                <TerminalTabViewSection
                    key={key}
                    title={section.title}
                    items={section.items}
                />
            ))}
        </>
    );
};

export default StatePropertiesSections;

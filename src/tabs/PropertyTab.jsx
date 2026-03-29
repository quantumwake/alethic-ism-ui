import React, { useRef } from "react";
import {useStore} from '../store';
import {SaveIcon} from "lucide-react";
import {TerminalButton, TerminalLabel} from "../components/common";
import StatePropertyTab from "./property/StatePropertyTab";
import ProcessorPropertyTab from "./property/ProcessorPropertyTab";
import EdgePropertyTab from "./property/EdgePropertyTab";

const PropertyTab = () => {
    const {selectedNodeId} = useStore()
    const {selectedEdgeId} = useStore()
    const theme = useStore(state => state.getCurrentTheme());
    const selectedNode = useStore(state => state.getNode(selectedNodeId));
    const saveRef = useRef(null);

    const handleSave = async () => {
        if (saveRef.current) {
            await saveRef.current();
        }
    }

    const nodeType = selectedNode?.type;

    return (<div className={`relative flex-grow h-screen flex w-full ${theme.bg}`}>
                <div className="z-50 absolute top-2 right-6 flex gap-4">
                    <TerminalButton onClick={handleSave} variant="primary">
                        <SaveIcon className="w-4 h-h"/>
                    </TerminalButton>
                </div>

                {/* properties */}
                <div className={`${theme.font} ${theme.border} w-full overflow-y-auto`} style={{overflowX: 'visible'}}>
                    {selectedNodeId && selectedNode && (<>
                        <div className={`${theme.text} ${theme.spacing.base} mb-0`}>
                            <TerminalLabel>{selectedNodeId}</TerminalLabel>
                        </div>
                        {nodeType === "state" && (
                            <StatePropertyTab saveRef={saveRef} />
                        )}
                        {nodeType?.startsWith("processor") && (
                            <ProcessorPropertyTab saveRef={saveRef} />
                        )}
                    </>)}
                    {!selectedNodeId && selectedEdgeId && (<>
                        <div className={`${theme.text} ${theme.spacing.base} mb-0`}>
                            <TerminalLabel>{selectedEdgeId}</TerminalLabel>
                        </div>
                        <EdgePropertyTab/>
                    </>)}
                </div>
            </div>)
}

export default PropertyTab

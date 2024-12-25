import React from "react";
import {useStore} from '../store';
import {SaveIcon} from "lucide-react";
import {TerminalButton} from "../components/common";
import StatePropertyTab from "./property/StatePropertyTab";
import ProcessorPropertyTab from "./property/ProcessorPropertyTab";

const PropertyTab = () => {
    const {selectedNode} = useStore()
    const {createState, createProcessor} = useStore()
    const theme = useStore(state => state.getCurrentTheme());

    const handleSave = async () => {
        if (!selectedNode) {
            console.warn("unable to persist node, no node selected.")
            return
        }
        if (selectedNode.type === "state") {
            const newState = await createState(selectedNode.id)
            console.log('saved state: ' + newState)
        } else if (selectedNode.type.includes("processor")) {
            const processor = await createProcessor(selectedNode.id)
            console.log(`saved processor: ${processor}`)
        }
    }

    return (<div className="flex flex-col w-full">
            {/* toolbar */}
            <div className={`${theme.font} ${theme.bg} ${theme.border} p-1.5 border-b-4`}>
                <TerminalButton
                    variant="secondary"
                    // size="large"
                    children={<span>Save</span>}
                    onClick={handleSave}
                    icon={<SaveIcon className="w-4 h-4"/>}
                />
            </div>

            {/* properties */}
            <div className={`${theme.font} ${theme.bg} ${theme.border} overflow-y-auto`}>
                {selectedNode !== null && (<>
                    {selectedNode.type === "state" && (
                        <StatePropertyTab />
                    )}
                    {selectedNode.type.startsWith("processor") && (
                        <ProcessorPropertyTab />
                    )}
                </>)}
            </div>
    </div>)
}

export default PropertyTab
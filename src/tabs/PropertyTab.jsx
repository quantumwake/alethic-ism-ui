import React from "react";
import {useStore} from '../store';
import {RefreshCcwIcon, SaveIcon} from "lucide-react";
import {TerminalButton} from "../components/common";
import StatePropertyTab from "./property/StatePropertyTab";
import ProcessorPropertyTab from "./property/ProcessorPropertyTab";

const PropertyTab = () => {
    const {selectedNode} = useStore()
    const {updateNode, createState, createProcessor} = useStore()
    const theme = useStore(state => state.getCurrentTheme());

    const handleSave = async () => {
        if (!selectedNode) {
            console.warn("unable to persist node, no node selected.")
            return
        }

        if (selectedNode.type === "state") {
            // updateNode(selectedNode.id).then(() => {
                const newState = createState(selectedNode.id).then(() => {
                    console.log('saved state: ' + newState)
                })
            // })
        } else if (selectedNode.type.includes("processor")) {
            const processor = await createProcessor(selectedNode.id)
            console.log(`saved processor: ${processor}`)
        }
    }

    return (<div className={`relative flex-grow h-screen flex w-full ${theme.bg}`}>
                <div className="z-50 absolute top-2 right-6 flex gap-4">
                    <TerminalButton className="bg-yellow-200" onClick={handleSave} variant="primary">
                        <SaveIcon className="w-4 h-h"/>
                    </TerminalButton>
                </div>

                {/* properties */}
                <div className={`${theme.font} ${theme.border} w-full overflow-y-auto`}>
                    {selectedNode !== null && (<>
                        {selectedNode.type === "state" && (
                            <StatePropertyTab/>
                        )}
                        {selectedNode.type.startsWith("processor") && (
                            <ProcessorPropertyTab/>
                        )}
                    </>)}
                </div>
            </div>)
}

export default PropertyTab
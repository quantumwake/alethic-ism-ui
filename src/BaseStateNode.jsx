import React, {memo, useState} from 'react';
import BaseNode from "./BaseNode";
import useStore from "./store";
import StateConfigDialog from "./StateConfigDialog";
import StateDataUploadDialog from "./StateDataUploadDialog";
import StateDataViewDialog from "./StateDataViewDialog";
import TestQueryStateDialog from "./TestQueryStateDialog";
import InfoButton from "./InfoButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBroomBall} from "@fortawesome/free-solid-svg-icons/faBroomBall";
import {faDownload} from "@fortawesome/free-solid-svg-icons/faDownload";
import {faUpload} from "@fortawesome/free-solid-svg-icons/faUpload";
import {faEdit} from "@fortawesome/free-solid-svg-icons/faEdit";
import {faNoteSticky} from "@fortawesome/free-solid-svg-icons/faNoteSticky";
import ConfirmationDialog from "./ConfirmationDialog";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import StateStreamDialog from "./StateStreamDialog";
import StateDataFilterDialog from "./StateDataFilterDialog";
import {
    faArrowRight,
    faChevronLeft,
    faDeleteLeft,
    faFileUpload,
    faFilter,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import {faInbox} from "@fortawesome/free-solid-svg-icons/faInbox";
import {faAnchor} from "@fortawesome/free-solid-svg-icons/faAnchor";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons/faArrowRightFromBracket";
import {faArrowRightToBracket} from "@fortawesome/free-solid-svg-icons/faArrowRightToBracket";

function BaseStateNode({ nodeId, renderAdditionalControls, renderAdditionalContent, theme }) {
    const [isOpenProp, setIsOpenProp] = useState(false)
    const [isOpenUpload, setIsOpenUpload] = useState(false)
    const [isOpenView, setIsOpenView] = useState(false)
    const [isConfirmation, setIsConfirmation] = useState(false)
    const [isDeleteConfirmation, setIsDeleteConfirmation] = useState(false)
    const [isOpenTestQueryState, setIsOpenTestQueryState] = useState(false)
    const [isOpenStateStreamDialog, setIsOpenStateStreamDialog] = useState(false);
    const [isOpenStateDataFilterDialog, setIsOpenStateDataFilterDialog] = useState(false);
    const nodeData = useStore(state => state.getNodeData(nodeId))
    const purgeStateData = useStore(state => state.purgeStateData)
    const deleteState = useStore(state => state.deleteState)

    const {setChannelInputId, setChannelOutputId} = useStore()

    // const setOutput = (ev) => {
    //     // alert('hello')
    // }

    const renderHeader = () => (
        <>
            <InfoButton id={nodeId} details={nodeData?.state_type}></InfoButton>
            {nodeData?.state_type}
        </>
    )

    const renderControls = () => (<>
        <button
            onClick={() => setIsOpenProp(true)}
            className="ml-1 px-1.5 py-0.5 h-6 bg-sky-500 text-white rounded-sm hover:bg-sky-900 focus:outline-none">
            {/*<PencilIcon className="h-6 w-3"/>*/}
            <FontAwesomeIcon className="h-4 w-2" icon={faEdit}/>
        </button>
        <button
            onClick={() => setIsOpenUpload(true)}
            className="ml-1 px-1.5 py-0.5 h-6 bg-red-500 text-white rounded-sm hover:bg-red-900 focus:outline-none">
            {/*<ArrowUpOnSquareStackIcon className="h-6 w-3"/>*/}
            <FontAwesomeIcon className="h-4 w-2" icon={faFileUpload}/>

        </button>
        <button
            onClick={() => setIsOpenView(true)}
            className="ml-1 px-1.5 py-0.5 h-6 bg-amber-500 text-white rounded-sm hover:bg-amber-900 focus:outline-none">
            {/*<ArrowDownOnSquareIcon className="h-6 w-3"/>*/}
            <FontAwesomeIcon className="h-4 w-2" icon={faDownload}/>

        </button>
        {/*<button*/}
        {/*    onClick={() => setIsOpenTestQueryState(true)}*/}
        {/*    className="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white rounded-sm hover:bg-yellow-300 focus:outline-none">*/}
        {/*    <FontAwesomeIcon className="h-6 w-3" icon={faNoteSticky} title="Test query input state entry"/>*/}
        {/*</button>*/}
        <button
            onClick={() => setIsConfirmation(true)}
            className="ml-1 px-1.5 py-0.5 h-6 bg-orange-600 text-white rounded-sm hover:bg-orange-400 focus:outline-none">
            <FontAwesomeIcon className="h-4 w-2" icon={faBroomBall}/>
            {/*<i class="fa-solid fa-broom"></i>*/}
        </button>
        <button
            onClick={() => setIsDeleteConfirmation(true)}
            className="ml-1 px-1.5 py-0.5 h-6 bg-orange-600 text-white rounded-sm hover:bg-orange-400 focus:outline-none">
            <FontAwesomeIcon className="h-4 w-2" icon={faTrashCan}/>
            {/*<i class="fa-solid fa-broom"></i>*/}
        </button>
        {/*<button*/}
        {/*    onClick={() => setIsOpenStateStreamDialog(true)}*/}
        {/*    className="ml-1 px-1.5 py-0.5 bg-orange-600 text-white rounded-sm hover:bg-orange-400 focus:outline-none">*/}
        {/*    <FontAwesomeIcon className="h-6 w-3" icon={faChevronRight}/>*/}
        {/*</button>*/}
        {/*<button*/}
        {/*    onClick={() => setIsOpenStateDataFilterDialog(true)}*/}
        {/*    className="ml-1 px-1.5 py-0.5 bg-orange-600 text-white rounded-sm hover:bg-orange-400 focus:outline-none">*/}
        {/*    <FontAwesomeIcon className="h-6 w-3" icon={faFilter}/>*/}
        {/*</button>*/}
        {renderAdditionalControls}
    </>);

    const renderContent = () => (<>
        <div className="flex p-1.5 font-bold">{nodeData?.config?.name}</div>

        {/*add additional node body*/}
        {renderAdditionalContent}

        <div className="mt-6 flex flex-row justify-between">
            <button
                onClick={() => setChannelInputId(nodeId)}
                className="flex items-center justify-center w-5 h-5 rounded-none hover:bg-blue-700 transition-colors duration-200"
                aria-label="Ingress">
                <FontAwesomeIcon className="h-4 w-3" icon={faArrowLeft}/>
            </button>

            <div className="font-semibold mx-2"></div>
            <button
                onClick={() => setChannelOutputId(nodeId)}
                className="flex flex-row items-start just w-5 h-5 rounded-none hover:bg-blue-700 transition-colors duration-200"
                aria-label="Egress">
                <FontAwesomeIcon className="h-4 w-3" icon={faArrowRight}/>
            </button>
        </div>
    </>);

    const onPurgeStateData = () => {
        purgeStateData(nodeId)
    }

    const onDeleteStateData = () => {
        deleteState(nodeId)
    }

    return (<>
        <BaseNode
            nodeId={nodeId}
            renderHeader={renderHeader}
            renderControls={renderControls}
            renderContent={renderContent}
            theme={theme}/>

        <ConfirmationDialog isOpen={isConfirmation} setIsOpen={setIsConfirmation} onAccept={onPurgeStateData}
                            title="Purge State Data!"
                            content="this process is irreversible... are you sure you wish to delete all data within the selected state."/>
        <ConfirmationDialog isOpen={isDeleteConfirmation} setIsOpen={setIsDeleteConfirmation} onAccept={onDeleteStateData}
                            title="Permanently Delete State!"
                            content="this process is irreversible... are you sure you wish to delete all data within the selected state."/>
        <StateConfigDialog isOpen={isOpenProp} setIsOpen={setIsOpenProp} nodeId={nodeId}/>
        <StateDataUploadDialog isOpen={isOpenUpload} setIsOpen={setIsOpenUpload} nodeId={nodeId}/>
        <StateDataViewDialog isOpen={isOpenView} setIsOpen={setIsOpenView} nodeId={nodeId}/>
        {/*<TestQueryStateDialog isOpen={isOpenTestQueryState} setIsOpen={setIsOpenTestQueryState} nodeId={nodeId}/>*/}
        {/*<StateStreamDialog isOpen={isOpenStateStreamDialog} setIsOpen={setIsOpenStateStreamDialog} nodeId={nodeId}/>*/}
        {/*<StateDataFilterDialog isOpen={isOpenStateDataFilterDialog} setIsOpen={setIsOpenStateDataFilterDialog} nodeId={nodeId}/>*/}

    </>);
}

export default memo(BaseStateNode);
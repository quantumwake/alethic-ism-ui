import {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfo} from "@fortawesome/free-solid-svg-icons/faInfo";

const CustomExpandInfo = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        // <div className="max-w-md mx-auto mt-4 p-4 bg-white shadow rounded-lg">
        <div>
            {/*<div className="flex items-center justify-between">*/}
                {/*<h2 className="text-lg font-semibold">Template Information</h2>*/}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    aria-expanded={isOpen}
                >
                    <FontAwesomeIcon icon={faInfo} />
                </button>
            {/*</div>*/}
            {isOpen && (
                <div className="mt-2 text-sm text-gray-600">
                    <p>Templates define how input data maps to structured output. Types include:</p>
                    <ol className="list-decimal list-inside mt-2">
                        <li>Python: Custom code processes input, returns output.</li>
                        <li>Mako: Text-based, renders dictionary input to prompts for models.</li>
                        <li>Others: Golang, routing templates, compute/GPU workloads.</li>
                    </ol>
                    <p className="mt-2">Process flow:</p>
                    <ol className="list-decimal list-inside mt-2">
                        <li>Input: Dictionary of values</li>
                        <li>Process: Function applies relevant template</li>
                        <li>Output: Rendered result, becomes input for next function</li>
                        <li>Repeat: Chain continues through defined paths</li>
                    </ol>
                </div>
            )}
        </div>
    );
};

export default CustomExpandInfo;
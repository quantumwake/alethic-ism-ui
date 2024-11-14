import React, {useEffect, useRef, useState} from "react";
import { Dialog, Transition } from "@headlessui/react";
import useStore from "./store";
import CustomList from "./CustomList";
import CustomListbox from "./CustomListbox";
import CustomInput from "./CustomInput";
import {Editor} from "@monaco-editor/react";
import ProjectTemplateInfo from "./ProjectTemplateInfo";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDoubleRight, faDiagramNext} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import {Tooltip} from "chart.js";
import {ClipboardIcon} from "@heroicons/react/24/outline"; // Import the styles

const templateTypes = [
    {type: 'mako', value: 'mako'},
    {type: 'simple', value: 'simple'},
    {type: 'python', value: 'python'},
    // {type: 'javascript', value: 'javascript'},
];

const templateSample = {

//////////////////////
// python templates //
//////////////////////

    "python": [
// python 1
{ "template_path": "simple runnable python instruction (restricted)", "content":
`class Runnable(BaseRunnable):

    # initialize any variables here
    def init(self, **kwargs):
        pass
    
    # if this instruction is connected to an output state that happens to be of type stream (StateConfig)
    def process_query_states(self, query_states: List[Dict]) -> List[Dict]:
        output_states = []
    
        for query_state in query_states:
            # add a new column named 'working' with value = "true" it can also be primitive
            query_state['working'] = "true"
            
            # append the outputs to the output state which will be returned
            output_states.append(query_state)
    
        # returns the new output states such that it can be passed in as an input to the next process
        return output_states

    # if this instruction is connected to an output state that happens to be of type stream (StateConfigStream)
    def process_stream(self, query_state: Any):
        # the data that is passed in is simply yielded to the stream 
        # (e.g. a websocket on the egress of an output state that happens to be a state stream config)
        yield json.dumps(query_state, indent=2)
 
`},
// python 2
{ "template_path": "simple runnable python (with api call)", "content": `class Runnable(BaseRunnable):
    
    # initialize any variables here
    def init(self, **kwargs):
        self.properties['API_URL'] = 'https://<fqdn>/<api>'

    def get_url(self):
        return self.properties['API_URL']

    # if this instruction is connected to an output state that happens to be of type stream (StateConfig)
    def process_query_states(self, query_states: List[Dict]) -> List[Dict]:
        output_states = []

        ##########################################################################################
        # Example: Iterating input states and appending random columns to the output state
        ##########################################################################################
        for query_state in query_states:
            # test appending data
            animal = query_state['animal']
            country = query_state['country']

            query_state = {
                **query_state,
                'animal and country': f"{animal} : {country}",
                'random_value': random.random()
            }

            output_states.append(query_state)

        ##########################################################################################
        # Example: Calling an API, returning the response and appending it to the output state
        ##########################################################################################
        #api_url = self.get_url()
        # try:
        #    response = requests.get(api_url)
        #    response.raise_for_status() # Raise an exception if the request fails
        #    query_statel'api_response'] = response.json() # Assuming the API returns JSON
        # except requests.RequestException as e:
        #    return {"error": str(e)} # Return an error message if the request fails

        # returns the new output states such that it can be passed in as an input to the next process
        return output_states

    # if this instruction is connected to an output state that happens to be of type stream (StateConfigStream)
    def process_stream(self, query_state: Any):
        # the data that is passed in is simply yielded to the stream 
        # (e.g. a websocket on the egress of an output state that happens to be a state stream config)
        yield json.dumps(query_state, indent=2)
`}],

////////////////////
// mako templates //
////////////////////
    'mako': [
        // mako template 1
{ "template_path": "simple chat input template", content:`Given input: "\${input}", provide brief response in the following json format.

\`\`\`json {
    "answer": "[answer]",
    "justification": "[justification for answer]",
    "alignment_score": "[from 1 to 100 score how well does the answer and justification align with the input]"
}\`\`\``},
    // mako template 2
{ "template_path": "mako based template that can be used on language models", "content": `DO NOT CHANGE ANYTHING JUST DISPLAY THIS
<%!
    def format_phone_numbers(phone_numbers):
        return ", ".join(phone_numbers)
%>

# User Details

- **First Name:** \${first_name}
- **Last Name:** \${last_name}
- **Age:** \${age}
- **Phone Numbers:** \${format_phone_numbers(phone_no)}
`}],

//////////////////////
// simple templates //
//////////////////////

    'simple':  [{ "template_path": "simple instruction that can be used in a language model", "content": `
given the following {input} provide a short and concise answer. output in the following json format.
    
\`\`\`json
{
    "answer": "[your answer]",
    "justification": "[justification for your answer]",
    "input_score": "[what score you would give the input from 1 to 100 and how aligned it is with your answer and justification]"
}
\`\`\`
`
}]}

function ProjectTemplateDialog({ isOpen, setIsOpen }) {

    const [templateId, setTemplateId] = useState('');
    const [templatePath, setTemplatePath] = useState('');
    const [templateType, setTemplateType] = useState('mako');
    const [templateContent, setTemplateContent] = useState('');
    const {templates, createTemplate, getTemplate, selectedProjectId} = useStore();
    const monacoRef = useRef(null);
    const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0)

    const resetContent = () => {
        setTemplateId('')
        setTemplatePath('')
        setTemplateContent('')
        setTemplateType('')
    }

    const chooseNextSample = () => {
        if (!templateType) {
            return
        }

        const templates = templateSample[templateType]
        if (!templates) {
            return
        }

        const count = templates.length
        let position = currentChoiceIndex
        if (currentChoiceIndex === count - 1) {
            position = 0
        } else {
            position += 1
        }
        setCurrentChoiceIndex(position)
        rotate(templateType, position)
    }

    const rotate = (template_type, position) => {
        if (!template_type) {
            return
        }

        const templates = templateSample[template_type]
        if (!templates) {
            return
        }

        const template = templates[position]
        const content = template['content']
        const path = template['template_path']
        setTemplateContent(content)
        setTemplatePath(path)
    }

    const chooseSample = (template_type) => {
        if (template_type === "") {
            resetContent()
            return
        }
        setTemplateType(template_type)
        rotate(template_type, 0)
    }

    const onClose = () => {
        resetContent()
        setIsOpen(false)
    }

    useEffect(() => {
        resetContent()
    }, [isOpen])

    const onAddTemplate = (e) => {
        // Create a new item object with the current form values and the selected project ID
        const newItem = {
            template_id: templateId,
            template_path: templatePath,
            template_type: templateType,
            template_content: templateContent,
            project_id: selectedProjectId
        };

        // Update the projectInstructionTemplates state with the new item
        createTemplate(newItem).then(r => {
            resetContent()
        })
    };

    const onDeleteTemplate = (e) => {

    };

    const onEditTemplate = (template) => {
        // const t = getTemplate(template.id)
        setTemplateId(template.template_id)
        setTemplatePath(template.template_path)
        setTemplateType(template.template_type)
        setTemplateContent(template.template_content)
    }

    const onEditorMount = (editor, monaco) => {
        // console.log('editorDidMount', editor);
        editor.focus();
    }

    //
    // const createDependencyProposals = useCallback((range) => {
    //     if (!monacoRef.current) return [];
    //
    //     // Define your attributes here
    //     const attributes = [
    //         'attribute1',
    //         'attribute2',
    //         'attribute3',
    //         // ... add more attributes as needed
    //     ];
    //
    //     return attributes.map(attr => ({
    //         label: attr,
    //         kind: monacoRef.current.languages.CompletionItemKind.Property,
    //         documentation: `This is the ${attr} attribute`,
    //         insertText: attr,
    //         range: range
    //     }));
    // }, []);
    //
    // const onEditorMount = useCallback((editor, monaco) => {
    //     monacoRef.current = monaco;
    //
    //     monaco.languages.registerCompletionItemProvider('python', {
    //         provideCompletionItems: (model, position) => {
    //             const wordInfo = model.getWordUntilPosition(position);
    //             const wordRange = new monaco.Range(
    //                 position.lineNumber,
    //                 wordInfo.startColumn,
    //                 position.lineNumber,
    //                 wordInfo.endColumn
    //             );
    //
    //             return {
    //                 // suggestions: createDependencyProposals(wordRange)
    //             };
    //         }
    //     });
    // // }, [createDependencyProposals]);
    // }, []);

    const searchTemplate = (template, term) => {
        // This is just an example. Adjust according to your data structure and search requirements
        return template['template_path'].toLowerCase().includes(term.toLowerCase());
    };

    // Hover on each property to see its docs!
    // const myEditor = monaco.editor.create(document.getElementById("container"), {
    //     value,
    //     language: "javascript",
    //     automaticLayout: true,
    // });



    const renderTemplate = (value) => <>
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
                   <span
                       className={`inline-block h-14 w-1 rounded-md ${
                           value?.template_type === "mako"
                               ? "bg-red-500"
                               : value?.template_type === "simple"
                                   ? "bg-green-500"
                                   : value?.template_type === "python"
                                       ? "bg-yellow-500"
                                       : "bg-blue-500" // default color for other types
                       }`}
                   ></span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    Name: {value && value?.template_path}
                </p>
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    Type: {value && value?.template_type}
                </p>
            </div>
        </div>
    </>

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center p-4 text-center">

                            <Dialog.Panel className="w-2/3 rounded-lg bg-stone-100 p-3 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3"
                                              className="-m-3 mb-4 p-4 flex text-2xl font-medium leading-6 bg-stone-300 text-stone-800 shadow-stone-950">
                                    Project Templates&nbsp;<ProjectTemplateInfo details=""></ProjectTemplateInfo>
                                </Dialog.Title>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-full sm:w-1/4">
                                        <CustomList values={templates}
                                                    searchFunction={searchTemplate}
                                                    renderItem={renderTemplate}
                                                    onItemClick={onEditTemplate} numOfColumns={1}/>

                                    </div>
                                    <div className="sm:w-3/4">
                                        {/* First Row */}
                                        <div className="flex w-full h-10">
                                            <div className="w-1/4 pr-2">
                                                <input id="template_id" name="template_id" type="hidden"
                                                       value={templateId}/>
                                                <CustomListbox
                                                    placeholder="choose template type..."
                                                    option_value_key="value"
                                                    option_label_key="type"
                                                    options={templateTypes}
                                                    onChange={chooseSample}
                                                    value={templateType}>
                                                </CustomListbox>
                                            </div>
                                            <div className="pr-2">
                                                <Tippy content="Get next sample">
                                                    <button
                                                        type="button"
                                                        className="rounded-none h-10 p-1 border border-transparent bg-blue-300 text-sm font-medium text-white hover:bg-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                                        onClick={chooseNextSample}><FontAwesomeIcon
                                                        icon={faAngleDoubleRight}/>
                                                    </button>
                                                </Tippy>
                                            </div>
                                            <div className="w-3/4">
                                                <CustomInput
                                                    placeholder="specify template name..."
                                                    name="template_path"
                                                    value={templatePath}
                                                    onChange={(e) => setTemplatePath(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Second Row */}
                                        <div className="mt-2 flex h-[500pt] bg-white w-full border-2 border-blue-600">
                                            <Editor
                                                onChange={(newValue) => setTemplateContent(newValue)}
                                                defaultLanguage="python"
                                                value={templateContent}
                                                onMount={onEditorMount}
                                                options={{
                                                    lineNumbers: 'on',
                                                    // lineNumbersMinChars: 3,
                                                    minimap: {
                                                        enabled: false
                                                    },
                                                    scrollBeyondLastLine: false,
                                                    // Add more options as needed
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full">
                                    <div className="flex w-1/2 justify-start">
                                        {/*<button*/}
                                        {/*    type="button"*/}
                                        {/*    className="inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"*/}
                                        {/*    onClick={onClose}>*/}
                                        {/*    Next Sample*/}
                                        {/*</button>*/}
                                    </div>
                                    <div className="flex w-1/2 justify-end">
                                        <button
                                            type="button"
                                            className={`ml-2 inline-flex rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                                                (!templatePath || !templateType || !templateContent) && "opacity-50 cursor-not-allowed"
                                            }`}
                                            onClick={(e) => onAddTemplate(e)}
                                            disabled={!templatePath || !templateType || !templateContent}>
                                            Save Template
                                        </button>

                                        <button
                                            type="button"
                                            className="ml-2 inline-flex rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                            onClick={onClose}>
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default ProjectTemplateDialog;

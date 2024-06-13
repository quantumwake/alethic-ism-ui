export const nodes = [

    {
        id: '0',
        type: 'processor_alethic_evaluator',
        data: {
            label: ""
        },
        position: { x: 1150, y: 185 },
    },
    {
        id: '1000',
        type: 'state',
        data: {
            label: "P(2-7)R Evaluation Benchmark",
        },
        position: { x: 1200, y: 600 },
    },

    // primary input data states (animals and instruction templates)
    {
        id: '1',
        type: 'state',
        data: {
            label: "Animal (A)",
        },
        position: { x: 0, y: 0 },
    },
    {
        id: '2',
        type: 'state',
        data: {
            label: "Instruction (IT)",
        },
        position: { x: 250, y: 0 },
    },
    {
        id: '3',
        type: 'state',
        data: {
            label: "Perspective (P)",
        },
        position: { x: 0, y: 250 },
    },
    {
        id: '4',
        type: 'state',
        data: {
            label: 'Animal (A) x Instruction (IT)',
        },
        position: { x: 250, y: 250 },
    },
    {
        id: '5',
        type: 'state',
        data: {
            label: "Animal (A) x Instruction (IT) x Perspective (P)",
        },
        position: { x: 125, y: 500 },
    },

    // output response states

    {
        id: '6',
        type: 'state',
        data: {
            label: "P0R Output Response",
        },
        position: { x: 850, y: 100 },
    },
    {
        id: '7',
        type: 'state',
        data: {
            label: "P1R Output Response",
        },
        position: { x: 850, y: 300 },
    },
    {
        id: '8',
        type: 'state',
        data: {
            label: "P(2-7)R Output Response",
        },
        position: { x: 850, y: 500 },
    },


    // merged state function and state output set (animal x instruction templates)
    //
    {
        id: '10',
        type: 'processor_dual_state_merge',
        data: {
            label: 'Animal (A) x Instruction (IT)',
        },
        position: { x: 125, y: 125 },
    },


    // perspective data state set merger
    {
        id: '11',
        type: 'processor_dual_state_merge',
        data: {
            label: 'A x IT x P',
        },
        position: { x: 125, y: 375 },
    },

    // P0 processors
    {
        id: '200',
        type: 'processor_openai',
        data: {
            label: 'P0 (Animal Perspective)',
        },
        position: { x: 550, y: 50 },
    },
    {
        id: '201',
        type: 'processor_anthropic',
        data: {
            label: 'P0 (Animal Perspective)',
        },
        position: { x: 550, y: 150 },
    },

    // P1 processor
    {
        id: '210',
        type: 'processor_openai',
        data: {
            label: 'P1 (LLM Default)',
        },
        position: { x: 550, y: 250 },
    },
    {
        id: '211',
        type: 'processor_anthropic',
        data: {
            label: 'P1 (LLM Default)',
        },
        position: { x: 550, y: 350 },
    },

    // P2-P7 processors
    {
        id: '220',
        type: 'processor_openai',
        data: {
            label: 'P2-P7 (Perspectives)',
        },
        position: { x: 550, y: 450 },
    },
    {
        id: '221',
        type: 'processor_anthropic',
        data: {
            label: 'P2-P7 (Perspectives)',
        },
        position: { x: 550, y: 550 },
    },
];

export const edges = [
    // connection from A & IT -> A x IT state merger
    { id: 'e1-100', source: '1', target: '10', animated: true },    // STATE(A)     -> MERGE(A x IT)
    { id: 'e2-100', source: '2', target: '10', animated: true },    // STATE(IT)    -> MERGE(A x IT)

    // connection from A x IT state merger -> A x IT state
    { id: 'e10-4', source: '10', target: '4', animated: true},    // MERGE(A x IT)    ->

    // state input into P0 to P7 openai
    { id: 'e4-200', source: '4', target: '200', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },
    { id: 'e5-210', source: '4', target: '210', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },
    { id: 'e5-220', source: '5', target: '220', animated: true, sourceHandle: "source-2", targetHandle: "target-2"},

    // state input into P0 to P7 anthropic
    { id: 'e4-201', source: '4', target: '201', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },
    { id: 'e5-211', source: '4', target: '211', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },
    { id: 'e5-221', source: '5', target: '221', animated: true, sourceHandle: "source-2", targetHandle: "target-2"},

    // processor openai to state outputs
    { id: 'e200-6', source: '200', target: '6', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e201-6', source: '201', target: '6', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e210-7', source: '210', target: '7', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e211-7', source: '211', target: '7', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e220-8', source: '220', target: '8', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e221-8', source: '221', target: '8', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)

    // P(0-7)R -> EVALUATOR P0
    { id: 'e6-0', source: '6', target: '0', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e7-0', source: '7', target: '0', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e8-0', source: '8', target: '0', animated: true, sourceHandle: "source-2", targetHandle: "target-2" },    // STATE(P) -> MERGE(A x IT x P)

    // connection from perspective to A x IT x P state merger
    { id: 'e3-11', source: '3', target: '11', animated: true },    // STATE(P) -> MERGE(A x IT x P)
    { id: 'e4-11', source: '4', target: '11', animated: true },    // STATE(A x IT) -> MERGE(A x IT x P)

    // connection from perspective to A x IT x P state merger
    { id: 'e11-5', source: '11', target: '5', animated: true },

    // final connectivity
    { id: 'e0-1000', source: '0', target: '1000', animated: true },

];

import type { NodeComponentProps } from '../../../kgraph';
import { StateNodeComponent } from './StateNodeComponent';
import { ProcessorNodeComponent } from './ProcessorNodeComponent';
import { TransformNodeComponent } from './TransformNodeComponent';
import { FunctionNodeComponent } from './FunctionNodeComponent';
import { ClusterNodeComponent } from './ClusterNodeComponent';

export const customNodeTypes: Record<string, React.ComponentType<NodeComponentProps>> = {
    state: StateNodeComponent,
    processor_python: ProcessorNodeComponent,
    processor_openai: ProcessorNodeComponent,
    processor_visual_openai: ProcessorNodeComponent,
    processor_google_ai: ProcessorNodeComponent,
    processor_anthropic: ProcessorNodeComponent,
    processor_llama: ProcessorNodeComponent,
    processor_mistral: ProcessorNodeComponent,
    processor_state_coalescer: TransformNodeComponent,
    processor_state_composite: TransformNodeComponent,
    processor_provider: ProcessorNodeComponent,
    trainer: ProcessorNodeComponent,
    function_datasource_sql: FunctionNodeComponent,
    cluster: ClusterNodeComponent,
};

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import CustomStudio, { CustomStudioProps } from './CustomStudio';

/**
 * CustomStudioWrapper - Wraps CustomStudio with ReactFlowProvider
 *
 * Use this component when embedding CustomStudio in your application.
 * The ReactFlowProvider is required for the useReactFlow hook to work.
 *
 * @example
 * ```tsx
 * import { CustomStudioWrapper } from './components/studio';
 *
 * function MyApp() {
 *   return (
 *     <CustomStudioWrapper
 *       initialNodes={[
 *         { id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Start' } }
 *       ]}
 *       onNodeCreate={(node) => console.log('Created:', node)}
 *       onNodeDelete={(id) => console.log('Deleted:', id)}
 *     />
 *   );
 * }
 * ```
 */
const CustomStudioWrapper: React.FC<CustomStudioProps> = (props) => {
    return (
        <ReactFlowProvider>
            <CustomStudio {...props} />
        </ReactFlowProvider>
    );
};

export default CustomStudioWrapper;

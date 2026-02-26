import registry from '../registry.js';

/**
 * State data operation tools — purge, sample, upload, export.
 */
export function registerDataTools() {

    // ─── Purge State Data ──────────────────────────────────────────────
    registry.register({
        name: 'purge_state_data',
        description: 'Delete ALL data in a state. This is destructive and cannot be undone.',
        category: 'data',
        confirm: true,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID to purge' },
            },
            required: ['state_id'],
        },
        execute: async (params, store) => {
            await store.purgeStateData(params.state_id);
            return { success: true, state_id: params.state_id, message: 'All data purged' };
        },
    });

    // ─── Get State Data (paginated) ────────────────────────────────────
    registry.register({
        name: 'get_state_data',
        description: 'Read data rows from a state with pagination. Returns up to 10 rows per call. Use offset to page through results. Also returns total row count and column definitions.',
        category: 'data',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                offset: { type: 'integer', description: 'Starting row index (default 0)', default: 0 },
                limit: { type: 'integer', description: 'Rows to return, max 10 (default 10)', default: 10 },
            },
            required: ['state_id'],
        },
        execute: async (params, store) => {
            const offset = params.offset || 0;
            const limit = Math.min(params.limit || 10, 10);

            const stateData = await store.fetchState(params.state_id, true, false, offset, limit);
            if (!stateData) return { success: false, error: 'Failed to fetch state data' };

            // Convert columnar data to row-oriented format for readability
            const columns = stateData.columns ? Object.keys(stateData.columns) : [];
            const rows = [];
            if (stateData.data && columns.length > 0) {
                // Determine row count from first column's data
                const firstCol = columns[0];
                const colData = stateData.data[firstCol];
                const values = colData?.values || colData?.data || [];
                const rowCount = Array.isArray(values) ? values.length : 0;

                for (let i = 0; i < rowCount; i++) {
                    const row = {};
                    for (const col of columns) {
                        const cd = stateData.data[col];
                        const vals = cd?.values || cd?.data || [];
                        row[col] = Array.isArray(vals) ? vals[i] : undefined;
                    }
                    rows.push(row);
                }
            }

            return {
                success: true,
                state_id: params.state_id,
                total_rows: stateData.count || 0,
                offset,
                limit,
                returned_rows: rows.length,
                has_more: offset + limit < (stateData.count || 0),
                columns,
                rows,
            };
        },
    });

    // ─── Upload State Data ─────────────────────────────────────────────
    registry.register({
        name: 'upload_state_data',
        description: 'Upload data rows to a state. Data should be an array of objects where keys are column names.',
        category: 'data',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                data: {
                    type: 'array',
                    description: 'Array of row objects to upload',
                    items: { type: 'object' },
                },
            },
            required: ['state_id', 'data'],
        },
        execute: async (params, store) => {
            // Use the forward/entry endpoint to push data rows
            for (const row of params.data) {
                await store.publishQueryState(params.state_id, row);
            }

            return {
                success: true,
                state_id: params.state_id,
                rows_uploaded: params.data.length,
            };
        },
    });

    // ─── Export State ──────────────────────────────────────────────────
    registry.register({
        name: 'export_state',
        description: 'Export all data from a state as a downloadable file.',
        category: 'data',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                filename: { type: 'string', description: 'Output filename (default: state_export.xlsx)', default: 'state_export.xlsx' },
            },
            required: ['state_id'],
        },
        execute: async (params, store) => {
            const filename = params.filename || 'state_export.xlsx';
            const ok = await store.exportStateData(params.state_id, filename);
            return {
                success: ok !== false,
                state_id: params.state_id,
                filename,
                message: ok !== false ? 'Export started — file will download in your browser' : 'Export failed',
            };
        },
    });
}

export default registerDataTools;

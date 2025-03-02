// src/services/SchemaService.js

/**
 * Service to manage schema information and query execution
 * This handles caching schemas by state_id/user_id and provides
 * methods for query parsing and execution
 */
class SchemaService {
    constructor() {
        // Cache schemas by state_id and user_id
        this.schemaCache = new Map();
        // Cache timeout in milliseconds (5 minutes)
        this.cacheTimeout = 5 * 60 * 1000;
    }

    /**
     * Get cache key for a schema
     * @param {string} stateId
     * @param {string} userId
     * @returns {string} Cache key
     */
    getCacheKey(stateId, userId) {
        return `${stateId}:${userId}`;
    }

    /**
     * Fetch schema for a given state and user
     * @param {string} stateId
     * @param {string} userId
     * @param {boolean} forceRefresh Force refresh from API
     * @returns {Promise<Object>} Schema object
     */
    async getSchema(stateId, userId, forceRefresh = false) {
        const cacheKey = this.getCacheKey(stateId, userId);

        // Check cache first (if not forcing refresh)
        if (!forceRefresh && this.schemaCache.has(cacheKey)) {
            const cachedData = this.schemaCache.get(cacheKey);
            // Return cached data if it's still valid
            if (Date.now() - cachedData.timestamp < this.cacheTimeout) {
                return cachedData.schema;
            }
        }

        // Fetch fresh data
        try {
            const schema = await this.fetchSchemaFromAPI(stateId, userId);

            // Store in cache with timestamp
            this.schemaCache.set(cacheKey, {
                schema,
                timestamp: Date.now()
            });

            return schema;
        } catch (error) {
            console.error('Failed to fetch schema:', error);
            throw new Error('Failed to fetch schema information');
        }
    }

    /**
     * Fetch schema from API
     * @param {string} stateId
     * @param {string} userId
     * @returns {Promise<Object>} Schema object
     */
    async fetchSchemaFromAPI(stateId, userId) {
        // In a real implementation, this would be an API call
        // For demo purposes, we'll return mock schemas

        try {
            const response = await fetch(`/api/schema?stateId=${stateId}&userId=${userId}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);

            // Fallback to mock data for demo purposes
            return this.getMockSchema(stateId);
        }
    }

    /**
     * Get mock schema for demo purposes
     * @param {string} stateId
     * @returns {Object} Mock schema
     */
    getMockSchema(stateId) {
        // Mock schemas to demonstrate functionality
        const schemas = {
            '9ab0f4ac-3d87-4437-9528-0163cc5367a8': {
                columns: ['question', 'answer', 'category', 'difficulty', 'created_at', 'updated_at', 'is_active'],
                operators: ['=', '!=', 'like', 'not like', '>', '<', '>=', '<=', 'is null', 'is not null'],
                examples: [
                    'question like %animal%',
                    'difficulty = hard',
                    'created_at > 2023-01-01'
                ]
            },
            'other-state-id': {
                columns: ['product', 'price', 'inventory', 'supplier', 'last_updated', 'category', 'is_featured'],
                operators: ['=', '!=', '>', '<', '>=', '<=', 'like', 'not like'],
                examples: [
                    'price < 100',
                    'category = electronics',
                    'is_featured = true'
                ]
            }
        };

        // Return the schema for the given state ID, or a default empty schema
        return schemas[stateId] || {
            columns: [],
            operators: [],
            examples: []
        };
    }

    /**
     * Execute a query
     * @param {Object} query Query object
     * @returns {Promise<Object>} Query results
     */
    async executeQuery(query) {
        try {
            // Validate the query
            this.validateQuery(query);

            // In a real implementation, this would make an API call
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(query)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Query execution failed:', error);
            throw new Error(`Failed to execute query: ${error.message}`);
        }
    }

    /**
     * Validate a query object
     * @param {Object} query
     * @throws {Error} If query is invalid
     */
    validateQuery(query) {
        // Basic validation
        if (!query) {
            throw new Error('Query is empty');
        }

        if (!query.state_id) {
            throw new Error('state_id is required');
        }

        if (!query.filter_groups || !Array.isArray(query.filter_groups) || query.filter_groups.length === 0) {
            throw new Error('filter_groups must be a non-empty array');
        }

        // Validate each filter group
        query.filter_groups.forEach((group, groupIndex) => {
            if (!group.filters || !Array.isArray(group.filters) || group.filters.length === 0) {
                throw new Error(`filter_groups[${groupIndex}].filters must be a non-empty array`);
            }

            if (!['AND', 'OR'].includes(group.group_logic)) {
                throw new Error(`filter_groups[${groupIndex}].group_logic must be either "AND" or "OR"`);
            }

            // Validate each filter
            group.filters.forEach((filter, filterIndex) => {
                if (!filter.column) {
                    throw new Error(`filter_groups[${groupIndex}].filters[${filterIndex}].column is required`);
                }

                if (!filter.operator) {
                    throw new Error(`filter_groups[${groupIndex}].filters[${filterIndex}].operator is required`);
                }

                // Value can be empty for certain operators like "is null"
                const nullOperators = ['is null', 'is not null'];
                if (filter.value === undefined && !nullOperators.includes(filter.operator)) {
                    throw new Error(`filter_groups[${groupIndex}].filters[${filterIndex}].value is required for operator "${filter.operator}"`);
                }
            });
        });
    }

    /**
     * Parse a natural language query string into a structured query object
     * @param {string} queryString Natural language query string
     * @param {string} stateId State ID
     * @param {string} userId User ID
     * @returns {Object} Structured query object
     */
    parseNaturalLanguageQuery(queryString, stateId, userId) {
        // Basic parsing for demo purposes
        // In a production environment, you might want to use a more sophisticated parser

        try {
            const filters = [];
            const parts = queryString.split(',').map(part => part.trim());

            for (const part of parts) {
                // Try to match patterns like "column operator value"
                // This is a simplified parser - a real implementation would be more robust
                const operatorPatterns = [
                    { op: 'like', regex: /\s+like\s+/i },
                    { op: 'not like', regex: /\s+not\s+like\s+/i },
                    { op: '=', regex: /\s*=\s*/ },
                    { op: '!=', regex: /\s*!=\s*/ },
                    { op: '>=', regex: /\s*>=\s*/ },
                    { op: '<=', regex: /\s*<=\s*/ },
                    { op: '>', regex: /\s*>\s*/ },
                    { op: '<', regex: /\s*<\s*/ },
                    { op: 'is null', regex: /\s+is\s+null\s*/i },
                    { op: 'is not null', regex: /\s+is\s+not\s+null\s*/i }
                ];

                let filter = null;

                for (const { op, regex } of operatorPatterns) {
                    const match = part.split(regex);

                    if (match.length === 2) {
                        const column = match[0].trim();
                        const value = match[1].trim();

                        filter = {
                            column,
                            operator: op,
                            value: ['is null', 'is not null'].includes(op) ? null : value
                        };

                        break;
                    }
                }

                if (filter) {
                    filters.push(filter);
                }
            }

            if (filters.length === 0) {
                throw new Error('No valid filters found in query string');
            }

            return {
                filter_groups: [
                    {
                        filters,
                        group_logic: 'AND'
                    }
                ],
                state_id: stateId,
                user_id: userId
            };
        } catch (error) {
            console.error('Failed to parse query string:', error);
            throw new Error(`Failed to parse query string: ${error.message}`);
        }
    }
}

export default new SchemaService();
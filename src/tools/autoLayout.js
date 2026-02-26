/**
 * Auto-Layout — intelligent node positioning for the chat assistant.
 *
 * Tracks positions of nodes created during a conversation turn and provides
 * smart defaults when the user doesn't specify coordinates.
 *
 * Positioning rules:
 *   1. If user specifies position → use it
 *   2. If connecting to existing node → place relative to that node
 *   3. If creating standalone → find empty canvas area, stagger in grid
 *   4. Pipeline pattern: states left, processors middle, output states right
 */

const GRID_SNAP = 16;
const NODE_SPACING_X = 300;
const NODE_SPACING_Y = 200;
const START_X = 100;
const START_Y = 100;

class AutoLayout {
    constructor() {
        this._sessionPositions = []; // positions used this conversation turn
    }

    /**
     * Reset tracked positions (call at start of each assistant turn).
     */
    reset() {
        this._sessionPositions = [];
    }

    /**
     * Get the next auto-position for a new node.
     *
     * @param {object} opts
     * @param {Array} opts.existingNodes — current workflowNodes from store
     * @param {string} opts.nodeType    — 'state' or 'processor_*'
     * @param {string} [opts.relativeToNodeId] — place relative to this node
     * @param {string} [opts.relation]  — 'right' | 'below' | 'left' | 'above'
     * @returns {{ x: number, y: number }}
     */
    getNextPosition({ existingNodes = [], nodeType, relativeToNodeId, relation } = {}) {
        // If placing relative to another node
        if (relativeToNodeId) {
            const refNode = existingNodes.find(n => n.id === relativeToNodeId);
            if (refNode) {
                const pos = this._relativePosition(refNode, relation || 'right');
                this._track(pos);
                return pos;
            }
        }

        // Find an empty spot that doesn't overlap existing or session nodes
        const allPositions = [
            ...existingNodes.map(n => n.position),
            ...this._sessionPositions,
        ];

        const pos = this._findEmptySpot(allPositions, nodeType);
        this._track(pos);
        return pos;
    }

    /**
     * Compute position relative to a reference node.
     */
    _relativePosition(refNode, relation) {
        const rx = refNode.position.x;
        const ry = refNode.position.y;

        switch (relation) {
            case 'right':
                return this._snap({ x: rx + NODE_SPACING_X, y: ry });
            case 'below':
                return this._snap({ x: rx, y: ry + NODE_SPACING_Y });
            case 'left':
                return this._snap({ x: rx - NODE_SPACING_X, y: ry });
            case 'above':
                return this._snap({ x: rx, y: ry - NODE_SPACING_Y });
            default:
                return this._snap({ x: rx + NODE_SPACING_X, y: ry });
        }
    }

    /**
     * Find an empty grid spot that doesn't collide with existing positions.
     */
    _findEmptySpot(allPositions, nodeType) {
        // Determine column based on node type for pipeline layout
        const isState = !nodeType || nodeType === 'state';
        const baseX = isState ? START_X : START_X + NODE_SPACING_X;

        // Try positions in a grid pattern
        for (let row = 0; row < 50; row++) {
            for (let col = 0; col < 10; col++) {
                const candidate = {
                    x: baseX + col * NODE_SPACING_X,
                    y: START_Y + row * NODE_SPACING_Y,
                };
                if (!this._collides(candidate, allPositions)) {
                    return this._snap(candidate);
                }
            }
        }

        // Fallback: offset from last session position
        const last = this._sessionPositions[this._sessionPositions.length - 1];
        if (last) {
            return this._snap({ x: last.x + NODE_SPACING_X, y: last.y });
        }
        return this._snap({ x: START_X, y: START_Y });
    }

    /**
     * Check if a candidate position collides with any existing position.
     * Uses a proximity threshold rather than exact match.
     */
    _collides(candidate, positions) {
        const threshold = 80; // px
        return positions.some(p =>
            Math.abs(p.x - candidate.x) < threshold &&
            Math.abs(p.y - candidate.y) < threshold
        );
    }

    /**
     * Snap position to grid.
     */
    _snap({ x, y }) {
        return {
            x: Math.round(x / GRID_SNAP) * GRID_SNAP,
            y: Math.round(y / GRID_SNAP) * GRID_SNAP,
        };
    }

    /**
     * Track a used position.
     */
    _track(pos) {
        this._sessionPositions.push(pos);
    }
}

// Singleton
const autoLayout = new AutoLayout();
export default autoLayout;

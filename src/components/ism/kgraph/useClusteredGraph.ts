import { useMemo } from 'react';
import type { KGraphNode, KGraphEdge } from '@quantumwake/kgraph';

interface GroupDefinition {
    name: string;
    color: string;
}

interface UseClusteredGraphResult {
    displayNodes: KGraphNode[];
    displayEdges: KGraphEdge[];
}

// Extract group ID from metadata.group (handles both string and object shapes)
function getNodeGroupId(node: KGraphNode): string | null {
    const g = node.data?.metadata?.group;
    if (!g) return null;
    if (typeof g === 'string') return g;
    return g.id || null;
}

export function useClusteredGraph(
    rawNodes: KGraphNode[],
    rawEdges: KGraphEdge[],
    collapsedGroups: Record<string, boolean>,
    groupDefinitions: Record<string, GroupDefinition>,
): UseClusteredGraphResult {
    return useMemo(() => {
        if (!rawNodes || !rawEdges) {
            return { displayNodes: rawNodes || [], displayEdges: rawEdges || [] };
        }

        // Find which groups are currently collapsed
        const activeCollapsed = Object.entries(collapsedGroups)
            .filter(([, isCollapsed]) => isCollapsed)
            .map(([groupId]) => groupId);

        // Fast path: no collapsed groups → return raw data with group annotations
        if (activeCollapsed.length === 0) {
            const annotatedNodes = rawNodes.map(node => {
                const groupId = getNodeGroupId(node);
                if (groupId && groupDefinitions[groupId]) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            _groupId: groupId,
                            _groupColor: groupDefinitions[groupId].color,
                            _groupName: groupDefinitions[groupId].name,
                        },
                    };
                }
                return node;
            });
            return { displayNodes: annotatedNodes, displayEdges: rawEdges };
        }

        // Build nodeId → collapsed groupId mapping
        const nodeToCollapsedGroup = new Map<string, string>();
        for (const node of rawNodes) {
            const groupId = getNodeGroupId(node);
            if (groupId && collapsedGroups[groupId]) {
                nodeToCollapsedGroup.set(node.id, groupId);
            }
        }

        // Compute centroid positions for each collapsed group
        const groupPositions = new Map<string, { sumX: number; sumY: number; count: number }>();
        for (const node of rawNodes) {
            const groupId = nodeToCollapsedGroup.get(node.id);
            if (!groupId) continue;
            const pos = groupPositions.get(groupId) || { sumX: 0, sumY: 0, count: 0 };
            pos.sumX += node.position.x;
            pos.sumY += node.position.y;
            pos.count += 1;
            groupPositions.set(groupId, pos);
        }

        // Build display nodes
        const displayNodes: KGraphNode[] = [];
        const addedClusterNodes = new Set<string>();

        for (const node of rawNodes) {
            const groupId = nodeToCollapsedGroup.get(node.id);
            if (groupId) {
                // Member of a collapsed group — add cluster node once
                if (!addedClusterNodes.has(groupId)) {
                    addedClusterNodes.add(groupId);
                    const pos = groupPositions.get(groupId)!;
                    const def = groupDefinitions[groupId] || { name: 'Group', color: '#6366f1' };
                    const memberCount = pos.count;

                    displayNodes.push({
                        id: `cluster-${groupId}`,
                        type: 'cluster',
                        position: {
                            x: pos.sumX / pos.count,
                            y: pos.sumY / pos.count,
                        },
                        data: {
                            groupId,
                            groupName: def.name,
                            groupColor: def.color,
                            memberCount,
                        },
                    });
                }
            } else {
                // Not in a collapsed group — annotate with group info if in an expanded group
                const expandedGroupId = getNodeGroupId(node);
                if (expandedGroupId && groupDefinitions[expandedGroupId]) {
                    displayNodes.push({
                        ...node,
                        data: {
                            ...node.data,
                            _groupId: expandedGroupId,
                            _groupColor: groupDefinitions[expandedGroupId].color,
                            _groupName: groupDefinitions[expandedGroupId].name,
                        },
                    });
                } else {
                    displayNodes.push(node);
                }
            }
        }

        // Build display edges
        const displayEdges: KGraphEdge[] = [];
        const edgeDedup = new Set<string>();

        for (const edge of rawEdges) {
            const sourceGroup = nodeToCollapsedGroup.get(edge.source);
            const targetGroup = nodeToCollapsedGroup.get(edge.target);

            // Both endpoints in the same collapsed group → hide (internal edge)
            if (sourceGroup && targetGroup && sourceGroup === targetGroup) {
                continue;
            }

            // Remap endpoints
            const newSource = sourceGroup ? `cluster-${sourceGroup}` : edge.source;
            const newTarget = targetGroup ? `cluster-${targetGroup}` : edge.target;
            const isRemapped = !!(sourceGroup || targetGroup);

            // Dedup: for remapped edges, ignore handles (multiple members → same target
            // should collapse to a single edge). For non-remapped edges, keep as-is.
            const dedupKey = isRemapped
                ? `${newSource}:${newTarget}`
                : `${newSource}:${edge.sourceHandle || ''}:${newTarget}:${edge.targetHandle || ''}`;
            if (edgeDedup.has(dedupKey)) continue;
            edgeDedup.add(dedupKey);

            displayEdges.push({
                ...edge,
                id: isRemapped ? `remapped-${edge.id}` : edge.id,
                source: newSource,
                target: newTarget,
            });
        }

        return { displayNodes, displayEdges };
    }, [rawNodes, rawEdges, collapsedGroups, groupDefinitions]);
}

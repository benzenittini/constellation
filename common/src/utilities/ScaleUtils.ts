
import { Block, BoundingBox, TypedMap } from "../datatypes";


/** 1 === root node, 2 === child of root, etc. */
export function getDepth(block: Block, blockLookup: TypedMap<Block>, depthFromBlockId?: string) {
    let depth = 1;
    let b = block;
    while (b?.parentBlockId !== undefined && b?.parentBlockId !== depthFromBlockId) {
        b = blockLookup[b.parentBlockId];
        depth++;
    }
    return depth;
}

/**
 * Depth of 1 === root node === scale of 1
 * Depth of 2 === scale of 1.5
 * Depth of 3 === scale of (1.5 * 1.5)
 */
export function calculateScale(depth: number) {
    return Math.pow(1.5, depth-1);
}

export function updateBounds(bounds: BoundingBox, originalDepth: number, newDepth: number, focalPoint?: { x: number, y: number }): BoundingBox {
    const scaleChange = calculateScale(originalDepth) / calculateScale(newDepth);
    const newBounds   = { ...bounds };

    // -- Update the position --
    if (focalPoint) {
        newBounds.x = focalPoint.x + (bounds.x - focalPoint.x) * scaleChange;
        newBounds.y = focalPoint.y + (bounds.y - focalPoint.y) * scaleChange;
    }

    // -- Update the size --
    newBounds.width  = newBounds.width  * scaleChange;
    newBounds.height = newBounds.height * scaleChange;

    return newBounds;
}
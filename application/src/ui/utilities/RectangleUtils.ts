
export function normalize(x: number, y: number, width: number, height: number): {x: number, y: number, width: number, height: number} {
    return {
        x: (width < 0 ? x + width : x),
        y: (height < 0 ? y + height : y),
        width: Math.abs(width),
        height: Math.abs(height),
    }
}

export function rectangleContainsPoint(rect: {x: number, y: number, width: number, height: number}, point: {x: number, y: number}): boolean {
    if (rect.x <= point.x && rect.x + rect.width >= point.x) {
        if (rect.y <= point.y && rect.y + rect.height >= point.y) {
            return true;
        }
    }
    return false;
}
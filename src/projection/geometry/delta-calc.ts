import { distance, mix } from "popmotion"
import { Axis, AxisDelta, Box, Delta } from "./types"

function calcLength(axis: Axis) {
    return axis.max - axis.min
}

export function isNear(value: number, target = 0, maxDistance = 0.01): boolean {
    return distance(value, target) < maxDistance
}

export function calcAxisDelta(
    delta: AxisDelta,
    source: Axis,
    target: Axis,
    origin: number = 0.5
) {
    delta.origin = origin
    delta.originPoint = mix(source.min, source.max, delta.origin)

    delta.scale = calcLength(target) / calcLength(source)
    if (isNear(delta.scale, 1, 0.0001) || isNaN(delta.scale)) delta.scale = 1

    delta.translate =
        mix(target.min, target.max, delta.origin) - delta.originPoint
    if (isNear(delta.translate) || isNaN(delta.translate)) delta.translate = 0
}

export function calcBoxDelta(
    delta: Delta,
    source: Box,
    target: Box
    // origin: ResolvedValues
): void {
    calcAxisDelta(delta.x, source.x, target.x)
    calcAxisDelta(delta.y, source.y, target.y)
}
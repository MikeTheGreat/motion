import sync, { getFrameData } from "framesync"
import { copyAxisBox } from "../../../utils/geometry"
import { VisualElement } from "../../types"
import { compareByDepth } from "../../utils/compare-by-depth"

function isProjecting(visualElement: VisualElement) {
    const { isEnabled } = visualElement.projection

    return (
        isEnabled ||
        visualElement.shouldResetTransform() ||
        visualElement.getProps()._applyTransforms
    )
}

export function collectProjectingAncestors(
    visualElement: VisualElement,
    ancestors: VisualElement[] = []
) {
    const { parent } = visualElement

    if (parent) collectProjectingAncestors(parent, ancestors)

    if (isProjecting(visualElement)) ancestors.push(visualElement)

    return ancestors
}

export function collectProjectingChildren(
    visualElement: VisualElement
): VisualElement[] {
    const children: VisualElement[] = []

    const addChild = (child: VisualElement) => {
        if (isProjecting(child)) children.push(child)
        child.children.forEach(addChild)
    }

    visualElement.children.forEach(addChild)

    return children.sort(compareByDepth)
}

/**
 * Update the layoutState by measuring the DOM layout. This
 * should be called after resetting any layout-affecting transforms.
 */
export function updateLayoutMeasurement(
    visualElement: VisualElement,
    rebase = true
) {
    if (visualElement.shouldResetTransform()) return

    const layoutState = visualElement.getLayoutState()

    visualElement.notifyBeforeLayoutMeasure(layoutState.layout)

    if (visualElement.getInstance().id === "inner-square-a") {
        console.log("measuring a")
    }
    if (visualElement.getInstance().id === "inner-square-b") {
        console.log("measuring b")
    }

    layoutState.isHydrated = true
    layoutState.layout = visualElement.measureViewportBox()
    layoutState.layoutCorrected = copyAxisBox(layoutState.layout)

    const { snapshot } = visualElement
    visualElement.notifyLayoutMeasure(
        layoutState.layout,
        snapshot ? snapshot.viewportBox : layoutState.layout
    )

    if (visualElement.getInstance().id === "child") {
        console.log("update layout measurement", snapshot?.viewportBox.x.min)
    }

    // TODO: Rebase to layout as transformed by parent
    // rebase && sync.update(() => visualElement.rebaseProjectionTarget())
}

/**
 * Record the viewport box as it was before an expected mutation/re-render
 */
export function snapshotViewportBox(
    visualElement: VisualElement,
    rebase = true
) {
    if (visualElement.shouldResetTransform()) return

    visualElement.snapshot = {
        taken: getFrameData().timestamp,
        transform: { ...visualElement.getLatestValues() },
        viewportBox: visualElement.measureViewportBox(
            visualElement.getProps()._applyTransforms ? true : false
        ),
    }

    /**
     * Update targetBox to match the snapshot. This is just to ensure
     * that targetBox is affected by scroll in the same way as the measured box
     */
    rebase &&
        visualElement.rebaseProjectionTarget(
            false,
            visualElement.snapshot.viewportBox
        )
}

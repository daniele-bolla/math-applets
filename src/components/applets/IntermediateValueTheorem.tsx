import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function IVTApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-4, 3, 4, -3], axis: true }}
            setup={(board: JXG.Board) => {

                const DISCONTINUITY_X = 1.75;
                const objectiveFunction: (x: number) => number = function (x: number): number {
                    return (x < DISCONTINUITY_X) ? Math.pow(x, 3) - 2 * x - 1 : Math.pow(x, 2) - 1;
                };

                const graph = board.create(
                    "functiongraph",
                    [objectiveFunction],
                    {
                        strokeColor: "blue",
                        strokeWidth: 2,
                    }
                );

                const point_a = board.create('glider', [-1.75, 0, board.defaultAxes.x], {
                    name: 'a',
                    face: '<>',
                    size: 6,
                    fillColor: '#4CAF50',
                    strokeColor: '#2E7D32',
                });

                const point_b = board.create('glider', [1.5, 0, board.defaultAxes.x], {
                    name: 'b',
                    face: '<>',
                    size: 6,
                    fillColor: '#F44336',
                    strokeColor: '#C62828',
                });

                const point_fa = board.create('point', [
                    () => point_a.X(),
                    () => objectiveFunction(point_a.X())
                ], {
                    // name: '(a, f(a))',
                    size: 1,
                    fillColor: '#4CAF50',
                    strokeColor: '#2E7D32',
                    fixed: true,
                });

                const point_fb = board.create('point', [
                    () => point_b.X(),
                    () => objectiveFunction(point_b.X())
                ], {
                    // name: '(b, f(b))',
                    size: 1,
                    fillColor: '#F44336',
                    strokeColor: '#C62828',
                    fixed: true,
                });

                const point_fa_on_y = board.create('point', [
                    0,
                    () => objectiveFunction(point_a.X())
                ], {
                    name: 'f(a)',
                    size: 1,
                    fillColor: '#4CAF50',
                    strokeColor: '#2E7D32',
                    fixed: true,
                });

                const point_fb_on_y = board.create('point', [
                    0,
                    () => objectiveFunction(point_b.X())
                ], {
                    name: 'f(b)',
                    size: 1,
                    fillColor: '#F44336',
                    strokeColor: '#C62828',
                    fixed: true,
                });

                // Vertical lines from a and b to f(a) and f(b)
                board.create('segment', [point_a, point_fa], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 1,
                    dash: 1,
                });

                board.create('segment', [point_b, point_fb], {
                    strokeColor: '#F44336',
                    strokeWidth: 1,
                    dash: 1,
                });

                // Horizontal lines from fa and fb to their projections on y-axis
                board.create('segment', [point_fa, point_fa_on_y], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 1,
                    dash: 1,
                });

                board.create('segment', [point_fb, point_fb_on_y], {
                    strokeColor: '#F44336',
                    strokeWidth: 1,
                    dash: 1,
                });

                // Check if interval [a,b] contains discontinuity
                function hasDiscontinuity() {
                    const a = Math.min(point_a.X(), point_b.X());
                    const b = Math.max(point_a.X(), point_b.X());
                    return a < DISCONTINUITY_X && DISCONTINUITY_X < b;
                }

                // Get y-value at discontinuity from left and right
                function getDiscontinuityYLeft() {
                    return Math.pow(DISCONTINUITY_X, 3) - 2 * DISCONTINUITY_X - 1; // limit from left
                }

                function getDiscontinuityYRight() {
                    return Math.pow(DISCONTINUITY_X, 2) + 1; // limit from right
                }

                let initialC = (objectiveFunction(point_a.X()) + objectiveFunction(point_b.X())) / 2;

                function isPointCinBetweenFaFb() {
                    const cValue = point_c.Y();
                    const faValue = point_fa.Y();
                    const fbValue = point_fb.Y();
                    return (faValue <= cValue && cValue <= fbValue) || (fbValue <= cValue && cValue <= faValue);
                }

                const point_c = board.create('glider', [0, initialC, board.defaultAxes.y], {
                    name: 'c',
                    face: '<>',
                    size: 6,
                    fillColor: '#FF9800',
                    strokeColor: '#E65100',
                });

                // CONTINUOUS INTERVAL - Shows when NO discontinuity
                board.create('segment', [point_fa_on_y, point_fb_on_y], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => !hasDiscontinuity()
                });

                // DISCONTINUOUS INTERVALS 
                // Left segment (from f(a) to discontinuity)
                const discont_point_left = board.create('point', [
                    0,
                    () => getDiscontinuityYLeft()
                ], {
                    visible: false,
                    fixed: true,
                });

                const discont_point_right = board.create('point', [
                    0,
                    () => getDiscontinuityYRight()
                ], {
                    visible: false,
                    fixed: true,
                });

                // Determine which segments to show based on interval direction
                board.create('segment', [point_fa_on_y, discont_point_left], {
                    strokeColor: '#FF9800',
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_a.X() < DISCONTINUITY_X
                });

                board.create('segment', [discont_point_right, point_fb_on_y], {
                    strokeColor: '#FF9800',
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_b.X() > DISCONTINUITY_X
                });

                board.create('segment', [point_fa_on_y, discont_point_right], {
                    strokeColor: '#FF9800',
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_a.X() > DISCONTINUITY_X
                });

                board.create('segment', [discont_point_left, point_fb_on_y], {
                    strokeColor: '#FF9800',
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_b.X() < DISCONTINUITY_X
                });

                // Gaps
                board.create('point', [0, () => getDiscontinuityYLeft()], {
                    size: 3,
                    fillColor: 'red',
                    strokeColor: 'darkred',
                    visible: false
                });

                board.create('point', [0, () => getDiscontinuityYRight()], {
                    size: 3,
                    fillColor: 'red',
                    strokeColor: 'darkred',
                    visible: false
                });

                // HIGHLIGHT X-AXIS INTERVAL from a to b when conditions are met
                board.create('segment', [point_a, point_b], {
                    strokeColor: '#00BCD4',
                    strokeWidth: 10,
                    opacity: 0.6,
                    fixed: true,
                    visible: isPointCinBetweenFaFb
                });

                // Horizontal line at y = c
                const lineC = board.create('line', [
                    [0, () => point_c.Y()],
                    [1, () => point_c.Y()]
                ], {
                    strokeColor: '#FF9800',
                    strokeWidth: 2,
                    dash: 1,
                    fixed: true,
                    visible: isPointCinBetweenFaFb
                });

                // Helper function to check if x is in interval [a, b]
                function isPointXCoordInIntervalAB(x: number): boolean {
                    if (!isFinite(x) || isNaN(x)) return false;

                    const minX = Math.min(point_a.X(), point_b.X());
                    const maxX = Math.max(point_a.X(), point_b.X());

                    return minX <= x && x <= maxX;
                }

                // Create intersection points of lineC with the graph
                const intersection_0 = board.create('intersection', [graph, lineC, 0], {
                    name: 'x_0',
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    visible: false // Set to false initially, will be controlled by attribute below
                });

                const intersection_1 = board.create('intersection', [graph, lineC, 1], {
                    name: 'x_1',
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    visible: false
                });

                const intersection_2 = board.create('intersection', [graph, lineC, 2], {
                    name: 'x_2',
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    visible: false
                });

                intersection_0.setAttribute({
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_0.X())
                });

                intersection_1.setAttribute({
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_1.X())
                });

                intersection_2.setAttribute({
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_2.X())
                });

                // Create projection points on x-axis for each intersection
                const projection_0 = board.create('point', [
                    () => intersection_0.X(),
                    0
                ], {
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_0.X()),
                    fixed: true
                });

                const projection_1 = board.create('point', [
                    () => intersection_1.X(),
                    0
                ], {
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_1.X()),
                    fixed: true
                });

                const projection_2 = board.create('point', [
                    () => intersection_2.X(),
                    0
                ], {
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_2.X()),
                    fixed: true
                });

                // Vertical segments from intersections to x-axis
                board.create('segment', [intersection_0, projection_0], {
                    strokeColor: '#9C27B0',
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_0.X())
                });

                board.create('segment', [intersection_1, projection_1], {
                    strokeColor: '#9C27B0',
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_1.X())
                });

                board.create('segment', [intersection_2, projection_2], {
                    strokeColor: '#9C27B0',
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_2.X())
                });

            }}
        />
    );
}

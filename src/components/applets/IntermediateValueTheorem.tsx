import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
    COLORS,
    createFunctionGraph,
    createGlider,
    createPoint,
    createSegment
} from "../../utils/jsxgraph";

export default function IVTApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-4, 3, 4, -3], axis: true }}
            setup={(board: JXG.Board) => {

                const DISCONTINUITY_X = 1.75;
                const objectiveFunction: (x: number) => number = function (x: number): number {
                    return (x < DISCONTINUITY_X) ? Math.pow(x, 3) - 2 * x - 1 : Math.pow(x, 2) - 1;
                };

                const graph = createFunctionGraph(board, objectiveFunction, [-10, 10]);

                const point_a = createGlider(board, [-1.75, 0, board.defaultAxes.x], {
                    name: 'a',
                }, COLORS.green);

                const point_b = createGlider(board, [1.5, 0, board.defaultAxes.x], {
                    name: 'b',
                }, COLORS.red);

                const point_fa = createPoint(board,
                    [() => point_a.X(), () => objectiveFunction(point_a.X())],
                    {
                        fixed: true,
                    },
                    COLORS.green
                );

                const point_fb = createPoint(board,
                    [() => point_b.X(), () => objectiveFunction(point_b.X())],
                    {
                        fixed: true,
                    },
                    COLORS.red
                );

                const point_fa_on_y = createPoint(board,
                    [0, () => objectiveFunction(point_a.X())],
                    {
                        name: 'f(a)',
                        fixed: true,
                    },
                    COLORS.green
                );

                const point_fb_on_y = createPoint(board,
                    [0, () => objectiveFunction(point_b.X())],
                    {
                        name: 'f(b)',
                        fixed: true,
                    },
                    COLORS.red
                );

                // Vertical lines from a and b to f(a) and f(b)
                createSegment(board, [point_a, point_fa], {
                    dash: 1,
                }, COLORS.green);

                createSegment(board, [point_b, point_fb], {
                    dash: 1,
                }, COLORS.red);

                // Horizontal lines from fa and fb to their projections on y-axis
                createSegment(board, [point_fa, point_fa_on_y], {
                    dash: 1,
                }, COLORS.green);

                createSegment(board, [point_fb, point_fb_on_y], {
                    dash: 1,
                }, COLORS.red);

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

                const initialC = (objectiveFunction(point_a.X()) + objectiveFunction(point_b.X())) / 2;

                function isPointCinBetweenFaFb() {
                    const cValue = point_c.Y();
                    const faValue = point_fa.Y();
                    const fbValue = point_fb.Y();
                    return (faValue <= cValue && cValue <= fbValue) || (fbValue <= cValue && cValue <= faValue);
                }

                const point_c = createGlider(board, [0, initialC, board.defaultAxes.y], {
                    name: 'c',
                }, COLORS.orange);

                // CONTINUOUS INTERVAL - Shows when NO discontinuity
                const continuousInterval = board.create('segment', [point_fa_on_y, point_fb_on_y], {
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => !hasDiscontinuity()
                });
                continuousInterval.setAttribute({strokeColor: COLORS.green});

                // DISCONTINUOUS INTERVALS
                // Left segment (from f(a) to discontinuity)
                const discont_point_left = createPoint(board,
                    [0, () => getDiscontinuityYLeft()],
                    {
                        visible: false,
                        fixed: true,
                    }
                );

                const discont_point_right = createPoint(board,
                    [0, () => getDiscontinuityYRight()],
                    {
                        visible: false,
                        fixed: true,
                    }
                );

                // Determine which segments to show based on interval direction
                const seg1 = board.create('segment', [point_fa_on_y, discont_point_left], {
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_a.X() < DISCONTINUITY_X
                });
                seg1.setAttribute({strokeColor: COLORS.orange});

                const seg2 = board.create('segment', [discont_point_right, point_fb_on_y], {
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_b.X() > DISCONTINUITY_X
                });
                seg2.setAttribute({strokeColor: COLORS.orange});

                const seg3 = board.create('segment', [point_fa_on_y, discont_point_right], {
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_a.X() > DISCONTINUITY_X
                });
                seg3.setAttribute({strokeColor: COLORS.orange});

                const seg4 = board.create('segment', [discont_point_left, point_fb_on_y], {
                    strokeWidth: 10,
                    opacity: 0.5,
                    fixed: true,
                    visible: () => hasDiscontinuity() && point_b.X() < DISCONTINUITY_X
                });
                seg4.setAttribute({strokeColor: COLORS.orange});

                // Gaps
                createPoint(board, [0, () => getDiscontinuityYLeft()], {
                    visible: false
                }, COLORS.red);

                createPoint(board, [0, () => getDiscontinuityYRight()], {
                    visible: false
                }, COLORS.red);

                // HIGHLIGHT X-AXIS INTERVAL from a to b when conditions are met
                createSegment(board, [point_a, point_b], {
                    strokeWidth: 10,
                    opacity: 0.6,
                    fixed: true,
                    visible: isPointCinBetweenFaFb
                }, COLORS.cyan);

                // Horizontal line at y = c
                const lineC = board.create('line', [
                    [0, () => point_c.Y()],
                    [1, () => point_c.Y()]
                ], {
                    strokeColor: COLORS.orange,
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
                    size: 1,
                    fillColor: COLORS.purple,
                    strokeColor: COLORS.darkPurple,
                    visible: false 
                });

                const intersection_1 = board.create('intersection', [graph, lineC, 1], {
                    name: 'x_1',
                    size: 1,
                    fillColor: COLORS.purple,
                    strokeColor: COLORS.darkPurple,
                    visible: false
                });

                const intersection_2 = board.create('intersection', [graph, lineC, 2], {
                    name: 'x_2',
                    size: 1,
                    fillColor: COLORS.purple,
                    strokeColor: COLORS.darkPurple,
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
                const projection_0 = createPoint(board,
                    [() => intersection_0.X(), 0],
                    {
                        visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_0.X()),
                        fixed: true
                    },
                    COLORS.purple
                );

                const projection_1 = createPoint(board,
                    [() => intersection_1.X(), 0],
                    {
                        visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_1.X()),
                        fixed: true
                    },
                    COLORS.purple
                );

                const projection_2 = createPoint(board,
                    [() => intersection_2.X(), 0],
                    {
                        visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_2.X()),
                        fixed: true
                    },
                    COLORS.purple
                );

                // Vertical segments from intersections to x-axis
                const vertSeg0 = board.create('segment', [intersection_0, projection_0], {
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_0.X())
                });
                vertSeg0.setAttribute({strokeColor: COLORS.darkPurple});

                const vertSeg1 = board.create('segment', [intersection_1, projection_1], {
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_1.X())
                });
                vertSeg1.setAttribute({strokeColor: COLORS.darkPurple});

                const vertSeg2 = board.create('segment', [intersection_2, projection_2], {
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                    visible: () => isPointCinBetweenFaFb() && isPointXCoordInIntervalAB(intersection_2.X())
                });
                vertSeg2.setAttribute({strokeColor: COLORS.darkPurple});

            }}
        />
    );
}

import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createPoint,
  createSlider,
  createLine,
  createPolygon,
  createArrow,
  createText
} from "../../utils/jsxgraph";

export default function LipschitzContinuityCombinedApplet() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-5, 5, 5, -5], axis: true }}
      setup={(board: JXG.Board) => {
        const f = (x: number) => Math.sin(x);
        const graph = createFunctionGraph(board, f, [-10, 10], {
          strokeWidth: 3,
        }, COLORS.blue);

        const p1 = createGlider(board, [-2, f(-2), graph], { name: "(f(x_1), x_1)" }, COLORS.orange);
        const p2 = createGlider(board, [2, f(2), graph], { name: "(f(x_2), x_2)" }, COLORS.orange);

        const lSlider = createSlider(
          board,
          [1, -4],
          [4, -4],
          [0.1, 1, 3],
          { name: "L" }
        );

        const isConditionMet = () =>
          Math.abs(p2.Y() - p1.Y()) <=
          lSlider.Value() * Math.abs(p2.X() - p1.X());

        const color = () => (isConditionMet() ? COLORS.lightGreen : COLORS.lightRed);

        // Secant Line
        createLine(board, [p1, p2], {
          dash: 2,
        }, COLORS.red);

        // Right-angled triangle
        const p3 = createPoint(board, [() => p2.X(), () => p1.Y()], { visible: false }, COLORS.black);
        createPolygon(board, [p1, p3, p2], {
        }, color);

        // Slope visualization (unit vectors)
        const slopeEndpointUp = createPoint(board, [() => p1.X() + 1, () => p1.Y() + lSlider.Value()], { visible: false }, COLORS.black);
        const slopeEndpointDown = createPoint(board, [() => p1.X() + 1, () => p1.Y() - lSlider.Value()], { visible: false }, COLORS.black);

        createArrow(board, [p1, slopeEndpointUp], {}, COLORS.black);
        createArrow(board, [p1, slopeEndpointDown], {}, COLORS.black);

        createText(board, [() => slopeEndpointUp.X() + 0.1, () => slopeEndpointUp.Y()], '+L', { anchorX: 'left' }, COLORS.black);
        createText(board, [() => slopeEndpointDown.X() + 0.1, () => slopeEndpointDown.Y()], '-L', { anchorX: 'left' }, COLORS.black);

        // Cone
        const coneStyle = {
          borders: { strokeWidth: 0 },
          layer: 0,
        };
        const [minX, , maxX] = board.getBoundingBox();
        createPolygon(board, [ p1, [maxX, () => p1.Y() + lSlider.Value() * (maxX - p1.X())], [maxX, () => p1.Y() - lSlider.Value() * (maxX - p1.X())] ], coneStyle, color);
        createPolygon(board, [ p1, [minX, () => p1.Y() + lSlider.Value() * (minX - p1.X())], [minX, () => p1.Y() - lSlider.Value() * (minX - p1.X())] ], coneStyle, color);

      }}
    />
  );
}
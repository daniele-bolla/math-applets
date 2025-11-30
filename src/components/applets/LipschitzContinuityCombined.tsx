import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

export default function LipschitzContinuityCombinedApplet() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-5, 5, 5, -5], axis: true }}
      setup={(board: JXG.Board) => {
        const f = (x: number) => Math.sin(x);
        const graph = board.create("functiongraph", [f], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
        });

        const p1 = board.create("glider", [-2, f(-2), graph], { ...DEFAULT_GLIDER_ATTRIBUTES, name: "(f(x_1), x_1)" });
        const p2 = board.create("glider", [2, f(2), graph], { ...DEFAULT_GLIDER_ATTRIBUTES, name: "(f(x_2), x_2)" });

        const lSlider = board.create(
          "slider",
          [
            [1, -4],
            [4, -4],
            [0.1, 1, 3],
          ],
          { name: "L" }
        );

        const isConditionMet = () =>
          Math.abs(p2.Y() - p1.Y()) <=
          lSlider.Value() * Math.abs(p2.X() - p1.X());
        
        const color = () => (isConditionMet() ? COLORS.lightGreen : COLORS.lightRed);

        // Secant Line
        board.create("line", [p1, p2], {
          strokeColor: COLORS.red,
          dash: 2,
        });

        // Right-angled triangle
        const p3 = board.create("point", [() => p2.X(), () => p1.Y()], { ...DEFAULT_POINT_ATTRIBUTES, visible: false });
        board.create("polygon", [p1, p3, p2], {
            fillColor: color,
            fillOpacity: 0.3,
            borders: { strokeColor: COLORS.black },
            layer: 0
        });
        
        // Slope visualization (unit vectors)
        const slopeEndpointUp = board.create('point', [() => p1.X() + 1, () => p1.Y() + lSlider.Value()], { ...DEFAULT_POINT_ATTRIBUTES, visible: false });
        const slopeEndpointDown = board.create('point', [() => p1.X() + 1, () => p1.Y() - lSlider.Value()], { ...DEFAULT_POINT_ATTRIBUTES, visible: false });

        board.create('arrow', [p1, slopeEndpointUp], { strokeColor: COLORS.black });
        board.create('arrow', [p1, slopeEndpointDown], { strokeColor: COLORS.black });
        
        board.create('text', [() => slopeEndpointUp.X() + 0.1, () => slopeEndpointUp.Y(), '+L'], { anchorX: 'left' });
        board.create('text', [() => slopeEndpointDown.X() + 0.1, () => slopeEndpointDown.Y(), '-L'], { anchorX: 'left' });

        // Cone
        const coneStyle = {
          fillColor: color,
          fillOpacity: 0.4,
          borders: { strokeWidth: 0 },
          layer: 0,
        };
        const [minX, , maxX] = board.getBoundingBox();
        board.create("polygon", [ p1, [maxX, () => p1.Y() + lSlider.Value() * (maxX - p1.X())], [maxX, () => p1.Y() - lSlider.Value() * (maxX - p1.X())] ], coneStyle );
        board.create("polygon", [ p1, [minX, () => p1.Y() + lSlider.Value() * (minX - p1.X())], [minX, () => p1.Y() - lSlider.Value() * (minX - p1.X())] ], coneStyle );

      }}
    />
  );
}
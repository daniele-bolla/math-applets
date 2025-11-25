import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function LipschitzContinuityCombined() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-5, 5, 5, -5], axis: true }}
      setup={(board: JXG.Board) => {
        const f = (x: number) => Math.sin(x);
        const graph = board.create("functiongraph", [f], {
          strokeColor: "#2196F3",
          strokeWidth: 3,
        });

        const p1 = board.create("glider", [-2, f(-2), graph], { name: "x" });
        const p2 = board.create("glider", [2, f(2), graph], { name: "y" });

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
        
        const color = () => (isConditionMet() ? "#aed581" : "#ef9a9a");

        // Secant Line
        board.create("line", [p1, p2], {
          strokeColor: "red",
          dash: 2,
        });

        // Right-angled triangle
        const p3 = board.create("point", [() => p2.X(), () => p1.Y()], { visible: false });
        board.create("polygon", [p1, p3, p2], {
            fillColor: color,
            fillOpacity: 0.3,
            borders: { strokeColor: "black" },
            layer: 0
        });

        // Vertical line for |f(x) - f(y)|
        const fy_minus_fx = () => Math.abs(p2.Y() - p1.Y());
        board.create("segment", [[-4.5, 0], [-4.5, fy_minus_fx]], { strokeColor: color, strokeWidth: 4 });
        board.create("text", [-4.5, -0.5, "|f(x) - f(y)|"], { anchorX: "middle", anchorY: "top" });

        // Vertical line for |x - y|
        const x_minus_y = () => Math.abs(p2.X() - p1.X());
        board.create("segment", [[-3.5, 0], [-3.5, x_minus_y]], { strokeColor: color, strokeWidth: 4 });
        board.create("text", [-3.5, -0.5, "|x - y|"], { anchorX: "middle", anchorY: "top" });

        // Vertical line for L
        const lValue = () => lSlider.Value();
        board.create("segment", [[-2.5, 0], [-2.5, lValue]], { strokeColor: color, strokeWidth: 4 });
        board.create("text", [-2.5, -0.5, "L"], { anchorX: "middle", anchorY: "top" });

        // Vertical line for L|x - y|
        const L_times_x_minus_y = () => lSlider.Value() * Math.abs(p2.X() - p1.X());
        board.create("segment", [[-1.5, 0], [-1.5, L_times_x_minus_y]], { strokeColor: color, strokeWidth: 4 });
        board.create("text", [-1.5, -0.5, "L|x - y|"], { anchorX: "middle", anchorY: "top" });

        // Slope visualization (unit vectors)
        const slopeOrigin = board.create('point', [4, 1], { name: '', fixed: true, size: 1, color: 'black' });
        const slopeEndpointUp = board.create('point', [() => slopeOrigin.X() + 1, () => slopeOrigin.Y() + lSlider.Value()], { visible: false });
        const slopeEndpointDown = board.create('point', [() => slopeOrigin.X() + 1, () => slopeOrigin.Y() - lSlider.Value()], { visible: false });

        board.create('arrow', [slopeOrigin, slopeEndpointUp], { strokeColor: 'black' });
        board.create('arrow', [slopeOrigin, slopeEndpointDown], { strokeColor: 'black' });
        
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

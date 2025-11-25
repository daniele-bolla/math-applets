import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function LipschitzContinuitySimple() {
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

        const segmentColor = () => (isConditionMet() ? "#aed581" : "#ef9a9a");

        const val1 = () => Math.abs(p2.Y() - p1.Y());
        const val2 = () => Math.abs(p2.X() - p1.X());
        const val3 = () => lSlider.Value();
        const val4 = () => lSlider.Value() * Math.abs(p2.X() - p1.X());

        const segmentOptions = {
            strokeColor: segmentColor,
            strokeWidth: 4,
            layer: 0,
        };

        // Segment for |f(x) - f(y)|
        board.create("segment", [[-4.5, 0], [-4.5, val1]], segmentOptions);
        board.create("text", [-4.5, -0.5, "|f(x) - f(y)|"], { anchorX: "middle", anchorY: "top" });

        // Segment for |x - y|
        board.create("segment", [[-3.5, 0], [-3.5, val2]], segmentOptions);
        board.create("text", [-3.5, -0.5, "|x - y|"], { anchorX: "middle", anchorY: "top" });

        // Slope visualization
        const slopeOrigin = board.create('point', [-2, 1], { name: '', fixed: true, size: 1, color: 'black' });
        const slopeEndpointUp = board.create('point', [() => slopeOrigin.X() + 1, () => slopeOrigin.Y() + lSlider.Value()], { visible: false });
        const slopeEndpointDown = board.create('point', [() => slopeOrigin.X() + 1, () => slopeOrigin.Y() - lSlider.Value()], { visible: false });

        board.create('arrow', [slopeOrigin, slopeEndpointUp], { strokeColor: 'black' });
        board.create('arrow', [slopeOrigin, slopeEndpointDown], { strokeColor: 'black' });
        
        board.create('text', [() => slopeEndpointUp.X() + 0.1, () => slopeEndpointUp.Y(), '+L'], { anchorX: 'left' });
        board.create('text', [() => slopeEndpointDown.X() + 0.1, () => slopeEndpointDown.Y(), '-L'], { anchorX: 'left' });
      }}
    />
  );
}

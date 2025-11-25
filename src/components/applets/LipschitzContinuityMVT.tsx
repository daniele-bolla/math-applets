import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function LipschitzContinuity() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-5, 5, 5, -5], axis: true }}
      setup={(board: JXG.Board) => {
        const f = (x: number) => Math.sin(x);
        const graph = board.create("functiongraph", [f], {
          strokeColor: "#2196F3",
          strokeWidth: 3,
        });

        const p1 = board.create(
          "glider",
          [-2, f(-2), graph],
          { name: "x" }
        );
        const p2 = board.create(
          "glider",
          [2, f(2), graph],
          { name: "y" }
        );

        board.create("line", [p1, p2], {
          strokeColor: "red",
          dash: 2,
        });

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

        const coneStyle = {
          fillColor: () => (isConditionMet() ? "#aed581" : "#ef9a9a"),
          fillOpacity: 0.4,
          borders: { strokeWidth: 0 },
          layer: 0,
        };

        const [minX, , maxX] = board.getBoundingBox();

        board.create(
          "polygon",
          [
            p1,
            [maxX, () => p1.Y() + lSlider.Value() * (maxX - p1.X())],
            [maxX, () => p1.Y() - lSlider.Value() * (maxX - p1.X())],
          ],
          coneStyle
        );

        board.create(
          "polygon",
          [
            p1,
            [minX, () => p1.Y() + lSlider.Value() * (minX - p1.X())],
            [minX, () => p1.Y() - lSlider.Value() * (minX - p1.X())],
          ],
          coneStyle
        );
      }}
    />
  );
}

import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

export default function CauchyMVTApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1.2, 3.4, 3.8, -1.8],
        axis: true,
        showZoom: false,
        showNavigation: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {

        board.create("text", [3.15, 0.2, "Re(z)"], {
          fixed: true,
          fontSize: 18,
          anchorX: "left",
        });
        board.create("text", [-0.15, 3.15, "Im(z)"], {
          fixed: true,
          fontSize: 18,
          anchorX: "left",
        });

        const O = board.create("point", [0, 0], {
          name: "",
          fixed: true,
          size: 3,
          color: "#000",
          fillOpacity: 1,
        });

        // z1 
        const z1 = board.create("point", [1, 2], {
          name: "",
          size: 4,
          color: COLORS.blue,
          fillColor: COLORS.blue,
          withLabel: false,
        });

        // z2 
        const z2 = board.create("point", [2, 0.5], {
          name: "",
          size: 4,
          color: COLORS.blue,
          fillColor: COLORS.blue,
          withLabel: false,
        });

        const z3 = board.create(
          "point",
          [
            () => z1.X() + z2.X(),
            () => z1.Y() + z2.Y(),
          ],
          {
            name: "",
            size: 4,
            color: COLORS.red,
            fillColor: COLORS.red,
            withLabel: false,
            fixed: true,
          }
        );

        const mainVectorStyle = {
          straightFirst: false,
          straightLast: false,
          lastArrow: true,
          strokeWidth: 3,
          highlight: false,
        };

        board.create("arrow", [O, z1], {
          ...mainVectorStyle,
          strokeColor: COLORS.blue,
        });
        board.create(
          "text",
          [() => z1.X() + 0.12, () => z1.Y() + 0.12, "z₁"],
          { color: COLORS.blue, fontSize: 18, fixed: false }
        );

        board.create("arrow", [O, z2], {
          ...mainVectorStyle,
          strokeColor: COLORS.blue,
        });
        board.create(
          "text",
          [() => z2.X() + 0.12, () => z2.Y() + 0.12, "z₂"],
          { color: COLORS.blue, fontSize: 18, fixed: false }
        );

        board.create("arrow", [O, z3], {
          ...mainVectorStyle,
          strokeColor: COLORS.red,
        });
        board.create(
          "text",
          [() => z3.X() + 0.12, () => z3.Y() + 0.12, "z₁ + z₂"],
          { color: COLORS.red, fontSize: 18, fixed: false }
        );

        // ============================================================
        // - from z2 to z1+z2 is a translated copy of z1  (label it z1)
        // - from z1 to z1+z2 is a translated copy of z2  (label it z2)
        // ============================================================
        const AUX = "#7EC8FF"; // light-azure
        const auxStyle = {
          straightFirst: false,
          straightLast: false,
          lastArrow: true,
          strokeColor: AUX,
          dash: 2,
          strokeWidth: 3,
          strokeOpacity: 0.95,
          highlight: false,
        };

        // z2 -> z3 equals z1 (translated)
        board.create("arrow", [z2, z3], { ...auxStyle });
        board.create(
          "text",
          [
            () => (z2.X() + z3.X()) / 2 + 0.08,
            () => (z2.Y() + z3.Y()) / 2 + 0.08,
            "z₁",
          ],
          { color: AUX, fontSize: 18, fixed: false }
        );

        // z1 -> z3 equals z2 (translated)
        board.create("arrow", [z1, z3], { ...auxStyle });
        board.create(
          "text",
          [
            () => (z1.X() + z3.X()) / 2 + 0.08,
            () => (z1.Y() + z3.Y()) / 2 + 0.08,
            "z₂",
          ],
          { color: AUX, fontSize: 18, fixed: false }
        );

        board.on("move", () => board.update());
      }}
    />
  );
}
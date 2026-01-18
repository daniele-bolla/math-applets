import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

type StepFunction = (x: number) => number;

const EPS = 1e-9;

function almostEqual(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

function uniqueSorted(arr: number[]) {
  return Array.from(new Set(arr)).sort((u, v) => u - v);
}

function cutsInRange(cuts: number[], start: number, end: number) {
  return cuts.filter((c) => c > start + EPS && c < end - EPS);
}

function setButtonText(btn: unknown, label: string) {
  const b = btn as { rendNodeButton?: HTMLElement | null };
  if (b.rendNodeButton) b.rendNodeButton.innerHTML = label;
}

function intersectAsSet(a: number[], b: number[]) {
  const bs = new Set(b);
  return new Set(a.filter((x) => bs.has(x)));
}

/**
 * Creates a staircase/step function given jump points and constant values.
 * jumps = [x0, x1, ..., xn], values = [c0, ..., c(n-1)]
 * value on [x_i, x_{i+1}) is values[i]
 */
function makeStepFunction(jumps: number[], values: number[]): StepFunction {
  return (x: number) => {
    if (x < jumps[0] || x > jumps[jumps.length - 1]) return 0;

    for (let i = 0; i < jumps.length - 1; i++) {
      if (x >= jumps[i] && x < jumps[i + 1]) return values[i];
    }

    // fallback (should only matter at the very right endpoint)
    return values[values.length - 1];
  };
}

export default function StepFunctionIntegral() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-5, 5, 9, -4] }}
      setup={(board: JXG.Board) => {

        const stepJumps = [-4, -1, 2, 5, 8];
        const stepValues = [1.5, -2, 2.5, -1];
        const phi = makeStepFunction(stepJumps, stepValues);

        // Draw the staircase graph (static)
        for (let i = 0; i < stepJumps.length - 1; i++) {
          board.create(
            "segment",
            [
              [stepJumps[i], stepValues[i]],
              [stepJumps[i + 1], stepValues[i]],
            ],
            {
              strokeColor: COLORS.blue,
              strokeWidth: 4,
              fixed: true,
              highlight: false,
            }
          );

          // dashed jump connector
          if (i < stepJumps.length - 2) {
            board.create(
              "segment",
              [
                [stepJumps[i + 1], stepValues[i]],
                [stepJumps[i + 1], stepValues[i + 1]],
              ],
              {
                strokeColor: COLORS.blue,
                strokeWidth: 1,
                dash: 2,
                fixed: true,
                highlight: false,
              }
            );
          }
        }

        // --------------------------------
        // INTEGRATION INTERVAL 
        // --------------------------------
        const baseSegment = board.create("segment", [[-4, 0], [8, 0]], {
          visible: false,
        });

        const gliderA = board.create("glider", [-4, 0, baseSegment], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "a",
          color: COLORS.blue,
        });

        const gliderB = board.create("glider", [8, 0, baseSegment], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "b",
          color: COLORS.blue,
        });

        // ----------------------------
        //  PARTITIONS 
        // ----------------------------
        const cutsZ1 = Array.from({ length: 7 }, (_, i) => -4 + 2 * i); // -4..8 step 2
        const cutsZ2 = Array.from({ length: 4 }, (_, i) => -3 + 3 * i); // -3..6 step 3 


        const sharedCuts = intersectAsSet(cutsZ1, cutsZ2);

        
        let partitionZ1Active = true;
        let partitionZ2Active = false;

        const btnStyle =
          "padding: 6px; border-radius: 4px; cursor: pointer; user-select: none;";

        const btnZ1 = board.create(
          "button",
          [
            3.5,
            -3.5,
            "Z1 [ ON ]",
            () => {
              partitionZ1Active = !partitionZ1Active;
              update(true);
            },
          ],
          {
            cssStyle: `${btnStyle} color: #E65100; background-color: #fff3e0;`,
            fixed: true,
          }
        );

        const btnZ2 = board.create(
          "button",
          [
            6.0,
            -3.5,
            "Z2 [ OFF ]",
            () => {
              partitionZ2Active = !partitionZ2Active;
              update(true);
            },
          ],
          {
            cssStyle: `${btnStyle} color: #4A148C; background-color: #f3e5f5;`,
            fixed: true,
          }
        );

        const infoText = board.create("text", [3.5, -5, ""], {
          fontSize: 16,
          fixed: true,
          visible: true,
          anchorX: "left",
        });

        // Rectangles / area fill
        const areaCurve = board.create("curve", [[0], [0]], {
          strokeWidth: 0,
          fillOpacity: 0.3,
          visible: true,
        });

        // Vertical partition marks 
        const z1Lines = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.orange,
          strokeWidth: 3,
          visible: true,
        });

        const z2UniqueLines = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.purple,
          strokeWidth: 3,
          visible: true,
        });

        const sharedLinesOverlay = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.purple,
          strokeWidth: 3,
          dash: 2,
          visible: true,
        });

        let areaLabels: JXG.Text[] = [];

        function clearAreaLabels() {
          areaLabels.forEach((t) => {
            try {
              board.removeObject(t);
            } catch {
              // ignore (in case already removed)
            }
          });
          areaLabels = [];
        }

        function currentMainColor() {
          if (partitionZ1Active && partitionZ2Active) return "#008080"; // refinement
          if (partitionZ2Active) return COLORS.purple;
          return COLORS.orange;
        }

        const update = (showLabels = true) => {
          board.suspendUpdate();

          setButtonText(btnZ1, `Z1 ${partitionZ1Active ? "[ ON ]" : "[ OFF ]"}`);
          setButtonText(btnZ2, `Z2 ${partitionZ2Active ? "[ ON ]" : "[ OFF ]"}`);

          clearAreaLabels();

          const a = gliderA.X();
          const b = gliderB.X();
          const start = Math.min(a, b);
          const end = Math.max(a, b);

          // Guard: interval collapsed
          if (almostEqual(start, end)) {
            areaCurve.setAttribute({ visible: false });
            z1Lines.dataX = [];
            z1Lines.dataY = [];
            z2UniqueLines.dataX = [];
            z2UniqueLines.dataY = [];
            sharedLinesOverlay.dataX = [];
            sharedLinesOverlay.dataY = [];

            infoText.setText("Choose a non-degenerate interval");
            infoText.setAttribute({ color: "black" });
            board.unsuspendUpdate();
            board.update();
            return;
          }

          // Determine active partition cuts within [start,end]
          const z1CutsRange = partitionZ1Active ? cutsInRange(cutsZ1, start, end) : [];
          const z2CutsRange = partitionZ2Active ? cutsInRange(cutsZ2, start, end) : [];

          // The refinement cuts: endpoints + jump points + active partition cuts
          const jumpCutsRange = cutsInRange(stepJumps, start, end);
          const activeCuts = uniqueSorted([start, end, ...jumpCutsRange, ...z1CutsRange, ...z2CutsRange]);

          // Draw partition vertical marks
          const xZ1: number[] = [];
          const yZ1: number[] = [];
          const xZ2Unique: number[] = [];
          const yZ2Unique: number[] = [];
          const xShared: number[] = [];
          const yShared: number[] = [];

          const pushVertical = (xs: number[], ys: number[], x: number, h: number) => {
            xs.push(x, x, NaN);
            ys.push(0, h, NaN);
          };

          if (partitionZ1Active) {
            for (const x of z1CutsRange) {
              const h = phi(x);
              const isShared = partitionZ2Active && sharedCuts.has(x);
              pushVertical(xZ1, yZ1, x, h);
              if (isShared) pushVertical(xShared, yShared, x, h);
            }
          }

          if (partitionZ2Active) {
            for (const x of z2CutsRange) {
              const h = phi(x);
              const isShared = partitionZ1Active && sharedCuts.has(x);
              if (!isShared) pushVertical(xZ2Unique, yZ2Unique, x, h);
            }
          }

          z1Lines.dataX = xZ1;
          z1Lines.dataY = yZ1;
          z2UniqueLines.dataX = xZ2Unique;
          z2UniqueLines.dataY = yZ2Unique;
          sharedLinesOverlay.dataX = xShared;
          sharedLinesOverlay.dataY = yShared;

          // If no partition selected, hide area and show message
          if (!partitionZ1Active && !partitionZ2Active) {
            areaCurve.setAttribute({ visible: false });
            infoText.setText("Select a partition");
            infoText.setAttribute({ color: "black" });

            board.unsuspendUpdate();
            board.update();
            return;
          }

          // Build rectangle fill polyline and compute sum
          const areaX: number[] = [];
          const areaY: number[] = [];
          let total = 0;

          for (let i = 0; i < activeCuts.length - 1; i++) {
            const x1 = activeCuts[i];
            const x2 = activeCuts[i + 1];
            const mid = (x1 + x2) / 2;

            const h = phi(mid);
            const subArea = h * (x2 - x1);
            total += subArea;

            // rectangle polygon points: (x1,0)->(x1,h)->(x2,h)->(x2,0)
            areaX.push(x1, x1, x2, x2);
            areaY.push(0, h, h, 0);

            if (showLabels && Math.abs(x2 - x1) > 0.4) {
              const label = board.create("text", [mid, h / 2, subArea.toFixed(2)], {
                fontSize: 10,
                color: "black",
                strokeColor: "white",
                strokeWidth: 2,
                anchorX: "middle",
                anchorY: "middle",
                layer: 9,
              });
              areaLabels.push(label);
            }
          }

          const color = currentMainColor();
          const partitionName =
            partitionZ1Active && partitionZ2Active
              ? "Refinement Z"
              : partitionZ2Active
                ? "Partition Z2"
                : "Partition Z1";

          areaCurve.dataX = areaX;
          areaCurve.dataY = areaY;
          areaCurve.setAttribute({ visible: true, fillColor: color });

          infoText.setText(`${partitionName}: I = ${total.toFixed(3)}`);
          infoText.setAttribute({ color });

          board.unsuspendUpdate();
          board.update();
        };

        // Drag behavior: don’t spam labels during drag
        const onDrag = () => update(false);
        const onStop = () => update(true);

        gliderA.on("drag", onDrag);
        gliderB.on("drag", onDrag);
        gliderA.on("up", onStop);
        gliderB.on("up", onStop);
        gliderA.on("down", onStop);
        gliderB.on("down", onStop);

        update(true);
      }}
    />
  );
}
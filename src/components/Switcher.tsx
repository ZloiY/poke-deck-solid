import { createEffect, createSignal, For, onCleanup } from "solid-js";
import { twMerge } from "tailwind-merge";

type TransitionState =
  | "Hold"
  | "Right Extend"
  | "Right Move"
  | "Right Shrink"
  | "Left Extend"
  | "Left Move"
  | "Left Shrink";

const dots = [
  { id: "swap_left", index: 0 },
  { id: "left", index: 1 },
  { id: "central", index: 2 },
  { id: "right", index: 3 },
  { id: "swap_right", index: 4 },
] as const;

type SelectDots<T> = T extends { id: string; index: number } ? T : never;

type Dot = SelectDots<(typeof dots)[keyof typeof dots]>;

export const Switcher = (props: {
  onNext: () => void,
  onPrev: () => void
}) => {
  const [transitionState, setTransitionState] = createSignal<TransitionState>("Hold");
  const changeDot = (dot: Dot) => () => {
    switch (dot.id) {
      case "left": {
        props.onPrev();
        setTransitionState("Left Extend");
        return;
      }
      case "right": {
        props.onNext();
        setTransitionState("Right Extend");
        return;
      }
      default:
        return;
    }
  }; 

  createEffect(() => {
    let timeoutId: NodeJS.Timeout;
    switch (transitionState()) {
      case "Right Extend": {
        timeoutId = setTimeout(() => {
          setTransitionState("Right Move");
        }, 500);
        break;
      }
      case "Right Move": {
        timeoutId = setTimeout(() => {
          setTransitionState("Right Shrink");
        }, 300);
        break;
      }
      case "Left Shrink":
      case "Right Shrink": {
        timeoutId = setTimeout(() => {
          setTransitionState("Hold");
        }, 700);
        break;
      }
      case "Left Extend": {
        timeoutId = setTimeout(() => {
          setTransitionState("Left Move");
        }, 500);
        break;
      }
      case "Left Move": {
        timeoutId = setTimeout(() => {
          setTransitionState("Left Shrink");
        }, 300);
        break;
      }
    }
    onCleanup(() => {
        timeoutId && clearTimeout(timeoutId);
      });
    });

  return (
    <div
      class="relative flex gap-3 justify-between items-center rounded-full bg-purple-700 p-1"
    >
      <For each={dots}>
        {(dot) => (
          <div
            role="button"
            class={twMerge(
              "rounded-full h-5 w-5 bg-white hover:bg-orange-500 active:bg-yellow-500 active:scale-90 duration-500 cursor-pointer",
              dot.id == "central" && "bg-yellow-500",
              dot.id == "central" &&
                transitionState() == "Right Extend" &&
                "absolute w-[53px] left-[40%] transition-all rounded-3xl",
              dot.id == "central" &&
                transitionState() == "Right Move" &&
                "absolute w-[53px] transition-all left-[3px] duration-300",
              dot.id == "central" &&
                transitionState() == "Right Shrink" &&
                "absolute transition-all w-5 left-[40%] duration-700",
              (dot.id == "swap_left" || dot.id == "swap_right") &&
                "opacity-0 absolute -z-10",
              dot.id == "swap_right" &&
                transitionState() == "Right Extend" &&
                "opacity-0 static",
              dot.id == "swap_right" &&
                transitionState() == "Right Move" &&
                "opacity-0 static",
              dot.id == "swap_right" &&
                transitionState() == "Right Shrink" &&
                "opacity-100 static transition-opacity z-auto",
              dot.id == "central" &&
                transitionState() == "Left Extend" &&
                "absolute w-[53px] -translate-x-8 left-[40%] transition-all rounded-3xl",
              dot.id == "central" &&
                transitionState() == "Left Move" &&
                "absolute w-[53px] transition-all right-[3px] duration-300",
              dot.id == "central" &&
                transitionState() == "Left Shrink" &&
                "absolute transition-all w-5 left-[39%] duration-700",
              dot.id == "swap_left" &&
                transitionState() == "Left Extend" &&
                "opacity-0 static",
              dot.id == "swap_left" &&
                transitionState() == "Left Move" &&
                "opacity-0 static",
              dot.id == "swap_left" &&
                transitionState() == "Left Shrink" &&
                "opacity-100 static transition-opacity z-auto",
            )}
            onClick={changeDot(dot)}
          ></div> 
        )}
      </For>
    </div>
  )
};

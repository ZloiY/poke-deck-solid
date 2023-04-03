import { createSignal } from "solid-js";

export const [flipState, setFlipState] = createSignal<FlipState>("Preview");
export const toggleFlip = () => {
 setFlipState((prev) => prev == "Preview" ? "Details" : "Preview");
};

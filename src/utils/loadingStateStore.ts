import { createSignal } from "solid-js";


export const [loadingState, setLoadingState] = createSignal<LoadingState>("Hold");

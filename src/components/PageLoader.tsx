import { createEffect, createSignal } from "solid-js";
import { useIsRouting } from "solid-start";
import { twMerge } from "tailwind-merge";
import { loadingState, setLoadingState } from "~/utils/loadingStateStore";


export const PageLoader = () => {
  const isRouting = useIsRouting();

  createEffect(() => {
    if (isRouting()) {
      setLoadingState("Started");
    } else {
      setLoadingState("Finished");
      const timeoutId = setTimeout(() => {
        setLoadingState("Hold");
        clearTimeout(timeoutId);
      }, 500);
    }
  });

  return (
    <div
      class={twMerge(
        "absolute h-[3px] left-0 top-0 bg-yellow-500 shadow-[0_0_15px_2px] shadow-yellow-300 transition-all z-[200]",
        loadingState() == "Hold" && "w-0",
        loadingState() == "Started" && "w-1/3 duration-1000 ease-in",
        loadingState() == "Finished" && "w-full duration-500 ease-out",
      )}
    ></div>
  );
};


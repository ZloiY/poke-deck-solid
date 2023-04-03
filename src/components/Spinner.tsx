import { twMerge } from "tailwind-merge";

import LoaderIcon from "@icons/loader.svg";

export const Spinner = (props: { className?: string }) => {
  return (
    <div class="flex items-center justify-center w-full h-full">
      <div
        class={twMerge(
          "h-15 w-15 animate animate-spin-slow text-purple-900",
          props.className,
        )}
      >
        <LoaderIcon />
      </div>
    </div>
  )
};

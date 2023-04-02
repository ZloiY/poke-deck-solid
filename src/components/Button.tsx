import { children, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import Loader from "@icons/loader.svg";

interface ButtonProps extends Omit<HTMLButtonElement, 'children'> {
  isLoading?: boolean;
  children?: Element;
}

export const Button = (props: ButtonProps) => {
  const [local, other] = splitProps(props, ["isLoading", "children"])
  const c = children(() => local.children);
  return (
    <button
    class={twMerge(
      `rounded-sm bg-blue-500 py-1 px-2 text-lg text-white cursor-pointer
    hover:shadow-[0_0_15px_4px] hover:shadow-zinc-400/50 hover:bg-yellow-500 active:bg-yellow-600 active:shadow-zinc-500/50
    disabled:bg-gray-500 disabled:hover:bg-gray-500 disabled:shadow-none disabled:cursor-auto disabled:text-gray-400`,
      other.className,
    )}
    {...other}
   >
   <Show when={local.isLoading} fallback={c()}>
      <div class="animate-spin-slow contrast-100 h-full w-full">
        <Loader />
      </div>
  </Show>
  </button>
  );
}

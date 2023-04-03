import { createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";

export const HighlightedLink = (props: { href: string, children: string }) => {
  const isHiglighted = createMemo(() => {
    if (typeof location !== 'undefined') {
      const firstPart = location.pathname.split("/")[1];
      return `/${firstPart}` == props.href;
    } else {
      return false;
    }
  });

  return (
    <a
      class={twMerge(
        "font-modak min-[580px]:text-8xl text-6xl lg:text-5xl hover:text-yellow-400",
        isHiglighted() && "text-yellow-500",
      )}
      href={props.href}
    >
      {props.children}
    </a> 
  );
};

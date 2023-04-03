import { children, JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export const BlankCard = (props: Partial<{
  className: string;
  onClick: () => void;
  children: JSX.Element;
  notInteractive: boolean; 
}>) => {
  const c = children(() => props.children);
  return (
    <div
      role="button"
      class={twMerge(
        `
      flex items-center justify-center
      relative
      rounded-xl
      bg-purple-900
      h-[500px] w-[300px] max-w-xs
      p-4
      text-white
      hover:shadow-[0_0_15px_4px] hover:shadow-orange-500`,
        props.notInteractive && "pointer-events-none select-none",
        props.className,
      )}
      onClick={props.onClick}
    >
    {c()}
    </div>
  );
};

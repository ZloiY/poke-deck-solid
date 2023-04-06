import { children, JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { BlankCard } from "../BlankCard";

export const BlankDeckCard = (props: {
  onClick?: () => void;
  children?: JSX.Element;
  notInteractive?: boolean;
  className?: string;
}) => {
  const c = children(() => props.children);
  return (
    <BlankCard
      className={twMerge(
        `transition-all border-2 border-transparent cursor-pointer text-white hover:text-yellow-500
    hover:shadow-none hover:border-yellow-500
    active:scale-90 active:border-transparent active:shadow-[0_0_30px_10px] active:shadow-yellow-500`,
        props.notInteractive && "pointer-events-none select-none",
        props.className,
      )}
      onClick={props.onClick}
    >
      {c()}
    </BlankCard>
  )
}

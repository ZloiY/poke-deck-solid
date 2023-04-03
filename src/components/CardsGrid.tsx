import { Pokemon } from "pokenode-ts";
import { children, For, JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export const cardGridStyles = `grid gap-y-10 gap-x-5 min-[1880px]:grid-cols-6 2xl:grid-cols-5 xl:grid-cols-4lg
lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 items-center justify-items-center`;

export const CardsGrid = (props: {
  pokemons?: Pokemon[],
  children: JSX.Element,
}) => {
  const c = children(() => props.children);
 return (
    <div class="h-full relative">
      <div class={twMerge("w-full mt-5", cardGridStyles)}>
       {c()}
      </div>
    </div>
  );
};

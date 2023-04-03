import { Pokemon } from "pokenode-ts";
import { Pokemon as PokemonDB } from "@prisma/client";
import { BlankCard } from "./BlankCard";
import { twMerge } from "tailwind-merge";

export const PreviewCard = (props: {
  pokemon: Pokemon | PokemonDB,
  className?: string;
  notInteractive?: boolean;
  nameOnSide?: boolean;
}) => {
  const imageUrl = "imageUrl" in props.pokemon
    ? props.pokemon.imageUrl
    : props.pokemon.sprites.other?.["official-artwork"].front_default ?? "";

  return (
     <BlankCard
      notInteractive={props.notInteractive}
      className={twMerge("text-3xl", props.className)}
    >
      <div
        class="
        flex
        h-full
        max-w-xs flex-col
        items-center
        justify-between"
      >
        <div class="relative h-full flex justify-center items-center">
          <img
            src={imageUrl}
            alt={`${props.pokemon.name} image`}
            height={250}
            width={200}
          />
        </div>
        <span
          class={twMerge(
            "capitalize text-white transition-transform duration-200",
            props.nameOnSide && "-translate-x-16 -translate-y-16 rotate-90",
          )}
        >
          {props.pokemon.name}
        </span>
      </div>
    </BlankCard>
  )
};

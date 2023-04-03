import { createEffect, createSignal, lazy, mergeProps, Suspense } from "solid-js";
import { twMerge } from "tailwind-merge";

import { PreviewCard } from "./PreviewCard";
const DetailsCard = lazy(() => import('./DetailsCard'));

type FlipCardProps = Parameters<typeof DetailsCard>[0] &
  Parameters<typeof PreviewCard>[0] & { keepFlipped?: FlipState };

export const FlipCard = (props: FlipCardProps) => {
  const merged = mergeProps({
      keepFlipped: "Preview" as FlipState,
      selectedPokemons: [],
      pokemonsInDeck: [],
  }, props);
  const isSelected = !![...merged.selectedPokemons, ...merged.pokemonsInDeck]
    .find((selectedPokemon) => selectedPokemon.name == props.pokemon.name);
  const [isHovered, toggleHovered] = createSignal<FlipState>(
    isSelected ? "Details" : merged.keepFlipped
  )
  createEffect(() => {
    toggleHovered(isSelected ? "Details" : merged.keepFlipped);
  })

  const unHover = () => {
    if (merged.keepFlipped != "Details" && !isSelected) {
      toggleHovered("Preview");
    }
  };

  return (
    <div
      class="relative"
      onMouseEnter={() => toggleHovered("Details")}
      onMouseLeave={unHover}
    >
      <div class={twMerge("z-10", isHovered() == "Details" && "opacity-0")}>
        <PreviewCard pokemon={merged.pokemon}/>
      </div>
      <Suspense fallback={<PreviewCard pokemon={merged.pokemon}/>}>
        <div class={twMerge("absolute top-0 z-30", isHovered() == "Preview" && "opacity-0")}>
          <DetailsCard
            pokemon={merged.pokemon}
            selectedPokemons={merged.selectedPokemons}
            isSelected={isSelected}
            pokemonsInDeck={merged.pokemonsInDeck}
            removeFromDeck={merged.removeFromDeck}
          />
        </div>
      </Suspense>
    </div>
  );
}

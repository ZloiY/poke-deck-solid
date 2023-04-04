import { createEffect, createSignal, lazy, mergeProps, Suspense } from "solid-js";
import { spring } from "motion";
import { motion } from "@motionone/solid";
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

  const flipMotion = motion;

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
      <div
        class="z-10"
        use:flipMotion={{
          initial: { opacity: 0, rotateY: 0, },
          animate: {
            opacity: isHovered() == "Preview" ? 1 : 0,
            perspective: "600px",
            rotateY: isHovered() == "Preview" ? 0 : 180
          },
          transition: {
            duration: 500,
            easing: spring({ mass: 2, stiffness: 60 })
          }
        }}
      >
        <PreviewCard pokemon={merged.pokemon}/>
      </div>
      <Suspense fallback={<PreviewCard pokemon={merged.pokemon}/>}>
        <div class="absolute top-0 z-30"
          use:flipMotion={{
            initial: { opacity: 0, rotateY: 180 },
            animate: {
              opacity: isHovered() == "Details" ? 1 : 0,
              perspective: "600px",
              rotateY: isHovered() == "Details" ? 0 : 180,
            },
            transition: {
              duration: 500,
              easing: spring({ mass: 2, stiffness: 60 }),
            }
          }}
        >
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

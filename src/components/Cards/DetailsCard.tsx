import { Pokemon } from "pokenode-ts";
import { createMemo, createSignal, For, Match, Switch } from "solid-js";
import { twMerge } from "tailwind-merge";

import { Pokemon as PokemonDB } from "@prisma/client";
import Add from "@icons/add.svg";
import Remove from "@icons/close-circle.svg";
import Delete from "@icons/delete.svg";

import { BlankCard } from "./BlankCard";
import { Switcher } from "../Switcher";
import { selectPokemon, unSelectPokemon } from "~/utils/selectedPokemonsStore";

export default function DetailsCard(props: {
  pokemon: Pokemon,
  user?: Session,
  pokemonsInDeck?: PokemonDB[],
  selectedPokemons?: Pokemon[],
  isSelected?: boolean,
  removeFromDeck?: (pokemon: Pokemon) => void,
}) {
  const [spriteKey, setSpriteKey] = createSignal(0);
  const pokemonAdded = createMemo(() =>
    !!props.selectedPokemons?.find(({ name }) => name == props.pokemon.name));
  const isDeckFull = (props.selectedPokemons?.length ?? 0) + (props.pokemonsInDeck?.length ?? 0)
    == +process.env.PUBLIC_DECK_MAX_SIZE!;
  const sprites = [
      props.pokemon?.sprites.other?.["official-artwork"].front_default,
      props.pokemon?.sprites.other?.dream_world.front_default,
      props.pokemon?.sprites.other?.dream_world.front_female,
      props.pokemon?.sprites.other?.home.front_default,
      props.pokemon?.sprites.other?.home.front_female,
      props.pokemon?.sprites.front_default,
      props.pokemon?.sprites.front_female,
    ].filter((item) => !!item);

  const switchSprite = (direction: "prev" | "next") => () => {
    if (direction == "next") {
      const newKey = spriteKey() + 1;
      if (newKey >= sprites.length) {
        setSpriteKey(0);
      } else {
        setSpriteKey(newKey);
      }
    } else {
      const newKey = spriteKey() - 1;
      if (newKey < 0) {
        setSpriteKey(sprites.length - 1);
      } else {
        setSpriteKey(newKey);
      }
    }
  }

  const currentSprite = createMemo(() => sprites[spriteKey()]);
  
  return (
      <BlankCard
        className={twMerge(
          "transition-all",
          props.isSelected && "shadow-[0_0_15px_4px] shadow-orange-500 scale-105",
        )}
      >
        <Switch> 
          <Match when={props.isSelected && pokemonAdded()}>
            <Remove
              role="button"
              class="absolute top-2 left-2 h-7 w-7 cursor-pointer text-red-500 hover:text-red-400 z-10"
              onClick={() => unSelectPokemon(props.pokemon)}
            />
          </Match>
          <Match when={!props.isSelected && !props.removeFromDeck && props.user && !isDeckFull}>
            <Add
              role="button"
              class="absolute top-2 left-2 h-7 w-7 cursor-pointer text-white hover:text-yellow-500 z-10"
              onClick={() => selectPokemon(props.pokemon)}
            />
          </Match>
          <Match when={props.removeFromDeck}>
            <Delete
              role="button"
              class="absolute top-2 left-2 h-10 w-10 cursor-pointer text-red-700 hover:text-red-400 z-10"
              onClick={() => props.removeFromDeck(props.pokemon)}
            />
          </Match>
        </Switch>
        <div class="relative h-full pb-4">
          <div class="flex h-full flex-col items-stretch justify-between gap-4 mt-2">
            <div class="flex gap-7">
              <div class="relative h-40 basis-40">
                <img src={currentSprite()!} alt={`${props.pokemon.name} image`} />
                <div
                  class="absolute bottom-0 right-0
            text-white scale-75"
                >
                  <Switcher
                    onNext={switchSprite("next")}
                    onPrev={switchSprite("prev")}
                  />
                </div>
              </div>
              <div class="flex flex-col items-center text-center gap-7">
                <span class="text-2xl capitalize">{props.pokemon.name}</span>
                <div class="flex flex-col gap-5">
                  <span class="text-xl">
                    Height:{" "}
                    <span class="text-yellow-500">
                      {props.pokemon.height ?? "..."}
                    </span>
                  </span>
                  <span class="text-xl">
                    Weight:{" "}
                    <span class="text-yellow-500">
                      {props.pokemon.weight ?? "..."}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <span class="text-xl">Abilities:</span>
              <div class="flex flex-wrap justify-between gap-1">
                <For each={props.pokemon.abilities}>
                  {(ability) => (
                    <span
                      class="text-lg capitalize text-yellow-500"
                    >
                      {ability.ability.name}
                    </span>
                  )}
                </For>
              </div>
            </div>
            <div class="self-end">
              <span class="text-xl">Stats:</span>
              <div class="grid grid-cols-3 items-end gap-x-6 gap-y-4">
                <For each={props.pokemon.stats}>
                  {(stat) => (
                    <div>
                      <span>{stat.stat.name}</span>
                      <div
                      class={twMerge(
                        "relative flex h-5 w-20 items-center justify-center border-2 border-orange-400 bg-transparent",
                        stat.base_stat > 100 && "border-0",
                        )}
                      >
                      <span class="z-10">{stat.base_stat}</span>
                      <div
                        class={twMerge(
                          "absolute top-0 left-0 h-full bg-orange-400",
                          stat.base_stat > 100 && "bg-red-500",
                          )}
                        style={{ width: `${stat.base_stat}%` }}
                      />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </BlankCard>
  )
}

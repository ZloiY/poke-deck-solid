import { useNavigate } from "solid-start";
import { createEffect, createResource, createSignal, For, onMount, Show, Suspense } from "solid-js";
import { twMerge } from "tailwind-merge";
import { Deck, Pokemon } from "@prisma/client";
import { motion } from "@motionone/solid";

import Add from "@icons/add-card.svg";
import Private from "@icons/private.svg";
import Delete from "@icons/delete.svg";

import { BlankDeckCard } from "./BlankDeckCard";
import { Spinner } from "~/components/Spinner";
import { PreviewCard } from "../PreviewCard";
import { trpc } from "~/trpc/api";

const getFirstSix = <T extends any>(arr: T[]): T[] => {
  const counter = 6;
  const getOne = (counter: number, result: T[], tail: T[]): T[] => {
    if (counter == 0 || !tail[0]) {
      return result;
    } else {
      const [head, ...newTail] = tail;
      return getOne(--counter, [...result, head], newTail);
    }
  };
  return getOne(counter, [], arr);
};

const getRandomShift = () => Math.ceil(Math.random() * 10 - 5);

export const FilledDeckCard = (props: DeckCard<Deck & { username?: string }>) => {
  const navigate = useNavigate();
  const [firstSixOrLess, { refetch }] = createResource(async () => {
    if (typeof window !== 'undefined') {
      const pokemons = await trpc(document.cookie)
        .pokemon.getPokemonsByDeckId.query(props.deck.id);
      return getFirstSix(pokemons);
    }
    return [];
  }, { initialValue: [] })

  const movingCards = motion;

  onMount(() => {
    refetch();
  });

  const [isHovered, setHovered] = createSignal(false);
  
  const rotate = (index: number) => isHovered()
    ? (-60 * firstSixOrLess().length) / 6 +
      ((index / (firstSixOrLess()?.length - 1)) * 120 * firstSixOrLess()?.length) /
        6
    : index * getRandomShift();

  const translateX = (index: number) => isHovered() ?
    -150 + (index / (firstSixOrLess()?.length - 1)) * 300 : 0;

  const translateY = (index: number) => isHovered()
    ? (-1 * index ** 2 + (firstSixOrLess()?.length - 1) * index) * -15
    : index * (props.notInteractive ? -4 : -10);

  const goToTheDeck = () => {
    if (props.deck.username) {
      navigate(`/decks/${props.deck.id}`);
    } else {
      navigate(`/pokemons/${props.deck.id}`);
    }
  };

  return (
    <BlankDeckCard
      className={props.className}
      notInteractive={props.notInteractive}
      onClick={() => props.onClick?.(props.deck.id)}
    >
      <Show when={!props.deck?.isFull && props.addCard}>
        <Add
          role="button"
          className="absolute top-2 left-1 w-14 h-14 text-white hover:text-yellow-400 active:text-yellow-500 active:scale-90 cursor-pointer"
          onClick={(event: Event) => {
            event.stopPropagation();
            props.addCard?.(props.deck.id)
          }}
        />
      </Show>
      <Show when={props.deck?.private}>
        <Private
          class={twMerge(
            "absolute top-2 right-1 text-white w-14 h-14",
            props.notInteractive && "top-1 right-0 w-5 h-5",
          )}
        />
      </Show>
      <div
        role="button"
        class={twMerge(
          "flex flex-col gap-5 justify-between items-center h-full",
          props.notInteractive && "gap-2 justify-end",
        )}
        onClick={goToTheDeck}
      >
        <div
          class={twMerge(
            "relative mt-20 w-40 h-60",
            props.notInteractive && "mt-0 mb-10 w-10 h-16",
          )}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <For each={firstSixOrLess()} fallback={<Spinner className="text-white"/>}>
            {(cards, index) => (
              <div
                class="absolute"
                use:movingCards={{
                  animate: {
                    y: translateY(index()),
                    x: translateX(index()),
                    rotate: rotate(index()),
                    zIndex: isHovered() ? 2 : 1,
                  }
                }}
              >
                <PreviewCard
                  className={twMerge(
                    "w-40 h-60 pb-0 text-xl border-2 rounded-xl border-yellow-500",
                    props.notInteractive && "w-14 h-24 text-xs border",
                  )}
                  pokemon={cards}
                  nameOnSide={isHovered()}
                  notInteractive
                />
              </div>
            )}
          </For>
        </div>
        <Show when={props.deck?.username}>
          <p class="text-2xl">Owner: {props.deck?.username}</p>
        </Show>
        <p class={twMerge("text-2xl", props.notInteractive && "text-base")}>
          {props.deck?.name}
        </p>
        <p class={twMerge("text-xl", props.notInteractive && "text-sm")}>
          {props.deck?.deckLength}/{import.meta.env.PUBLIC_DECK_MAX_SIZE}
        </p>
      </div>
      <Show when={props.removeDeck}>
        <Delete
          role="button"
          class="absolute right-1 bottom-2 w-14 h-14 text-red-700 hover:text-red-500 active:text-red-600 active:scale-90"
          onClick={(event: Event) => {
            event.stopPropagation();
            props.removeDeck?.(props.deck.id)
          }}
        />
      </Show>
    </BlankDeckCard>
  );
};

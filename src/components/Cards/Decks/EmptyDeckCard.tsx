import { Deck } from "@prisma/client";
import { twMerge } from "tailwind-merge";

import Private from "@icons/private.svg";
import AddCard from "@icons/add-card.svg";
import DeleteDeck from "@icons/delete.svg";

import { BlankDeckCard } from "./BlankDeckCard";
import { Show } from "solid-js";

type DeckCard<T> = {
  deck: T;
  onClick?: (id: string) => void;
  addCard?: (id: string) => void;
  removeDeck?: (id: string) => void;
  className?: string;
  notInteractive?: boolean;
};

export const EmptyDeckCard = (props: DeckCard<Deck & { username?: string }>) => {
  return (
    <BlankDeckCard className={props.className} notInteractive={props.notInteractive}>
      <Show when={props.deck.private}>
        <Private
          class={twMerge(
              "absolute top-2 left-1 w-10 h-10",
              props.notInteractive && "top-40 left-0",
            )}
        />
      </Show>
      <div
        onClick={() => props.addCard?.(props.deck.id)}
        class="relative flex justify-center items-center h-full w-full"
      >
        <div>
          <AddCard role="button" class="w-full h-full mx-auto" />
          <Show when={props.addCard}>
            <p class="font-coiny mt-4 text-2xl text-center">
              Add cards to the deck
            </p>
          </Show>
          <Show when={props.deck.username}>
            <p class="font-fredoka text-2xl text-center mt-2">
              Owner: {props.deck.username}
            </p>
          </Show>
        </div>
        <p
          class={twMerge(
            "absolute top-0 font-coiny text-3xl",
            props.notInteractive && "text-base",
          )}
        >
          {props.deck.name}
        </p>
      </div>
      <Show when={props.removeDeck}>
        <DeleteDeck
          class="absolute bottom-2 right-1 w-14 h-14 text-red-700 hover:text-red-500 active:text-red-600 active:scale-90"
          onClick={() => props.removeDeck?.(props.deck.id)}
         />
      </Show>
    </BlankDeckCard>
  );
}

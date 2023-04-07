import { motion } from "@motionone/solid";
import { Location, useIsRouting } from "@solidjs/router";
import { createEffect, createMemo, createResource, createSignal, For, lazy,  onMount,  Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { createRouteData, refetchRouteData,
  RouteDataArgs,
  useLocation, useNavigate, useRouteData, useSearchParams, useServerContext } from "solid-start";
import { FlipCard } from "~/components/Cards/FlipCard";

import Check from "@icons/check.svg";

import { CardsGrid } from "~/components/CardsGrid";
import { PaginationButtons } from "~/components/PaginationButtons";
import { SearchBar } from "~/components/SearchBar";
import { Spinner } from "~/components/Spinner";
import { trpc } from "~/trpc/api";
import { flipState } from "~/utils/flipStore";
import { pokemons } from "~/utils/selectedPokemonsStore";
import { cookieSessionStorage } from "~/utils/cookieSessionStorage";
import { appRouter } from "~/trpc/router";
import { prisma } from "~/db";
import { PokemonClient } from "pokenode-ts";
import { createServerData$ } from "solid-start/server";

const CreateDeck = lazy(() => import("~/components/Modals/CreateDeck"));
const AddCards = lazy(() => import("~/components/Modals/AddCards"));

const FixedButton = (props: {
  onClick: () => void,
  existingPokemonsLength: number,
}) => {
  const [hovered, toggleHover] = createSignal(false);
  
  return (
    <Show when={pokemons().length > 0}>
     <div
       role="button"
       onMouseEnter={() => toggleHover(true)}
       onMouseLeave={() => toggleHover(false)}
       class={`fixed right-2 bottom-2
         flex justify-center items-center rounded-full h-16 w-16 bg-white text-purple-900 text-2xl cursor-pointer
         hover:bg-green-500 hover:text-white transition-all z-50
         shadow-xl`
       }
       onClick={props.onClick}
     > 
       <Show when={!hovered()} fallback={<Check class="opacity-0 text-white hover:opacity-100 h-full w-full m-2"/>}>
         <p class="text-lg">
           {pokemons().length + props.existingPokemonsLength}/
           {import.meta.env.PUBLIC_DECK_MAX_SIZE}
         </p>
       </Show>
      </div>
    </Show>
  )
}

type PaginationState = "Initial" | "Next" | "Prev";

const getPage = (location: Location) => {
  let page = +location.pathname.split('/')[2]
  if (Number.isNaN(page) || !page) {
    page = 0;
  }
  return page;
}

export function routeData({ params }: RouteDataArgs) {
  const [searchParams] = useSearchParams();
  const emptyDecks = createServerData$(async (key, { request }) => {
    const session = await cookieSessionStorage.getSession(request.headers.get("Cookie"));
    const pokemonApi = new PokemonClient();
    const user = {
      id: session.get("id") as string,
      name: session.get("name") as string,
    }
    const caller = appRouter.createCaller({ session: user, prisma, pokemonApi });
    return await  caller.deck.getEmptyUserDecks({ numberOfEmptySlots: 20 });
  });
  const user = createServerData$(async (_, { request }) => {
    const session = await cookieSessionStorage.getSession(request.headers.get("Cookie"));
    const id = session.get("id");
    const name = session.get("name");
    if (id && name) {
      return { id, name } as Session;
    } else {
      return undefined;
    }
  });
  const pokemonsInCurrentDeck = createServerData$(async (key) => {
    const pokemonApi = new PokemonClient();
    const caller = appRouter.createCaller({ session: null, prisma, pokemonApi });
    return await caller.pokemon.getPokemonsByDeckId(key[0] ?? "");
  },
  { key: () => [searchParams.deckId] });
  return { emptyDecks, pokemonsInCurrentDeck, user };
};

const totalLength = 1275;
const limit = 15;
const totalPages = Math.ceil(totalLength / limit);
export default function Home() {
  const { emptyDecks, pokemonsInCurrentDeck, user } = useRouteData<typeof routeData>();
  const location = useLocation();
  const page = createMemo(() => getPage(location));
  const [cards, { refetch }] = createResource(async () => {
    if (!isServer) {
      const searchQuery = location.query.search as string;
      return await trpc("").pokemon.getPokemonList
        .query({ offset: page() * 15, limit: 15, searchQuery });
    } else {
      return [];
    }
  }, { initialValue: [] });

  const navigate = useNavigate();
  const isRouting = useIsRouting();
  const [searchParams, setSearchParams] = useSearchParams();

  const [paginationState, setPaginationState] = createSignal<PaginationState>("Initial");
  const [showModal, toggleModal] = createSignal(false);

  const hasNextPage = createMemo(() => page() < totalPages);
  const hasPrevPage = createMemo(() => page() > 0);

  const moveCards = motion;

  createEffect(() => {
    if (!isRouting()) {
      refetch();
      setPaginationState("Initial");
    }
  });

  const goToNextPage = () => {
    if (hasNextPage()) {
      setPaginationState("Next");
      navigate(`/home/${page() + 1}${location.search}`)
      refetchRouteData();
    }
  }

  const goToPrevPage = () => {
    if (hasPrevPage()) {
      setPaginationState("Prev");
      navigate(`/home/${page() - 1}${location.search}`);
      refetchRouteData();
    }
  }
  
  const onSearch = (search: string) => {
    setSearchParams({ search })     
  };

  const movingCards = createMemo((prev) => {
    switch (true) {
      case paginationState() == "Next": {
        return [0, -5000];
      }
      case paginationState() == "Prev": {
        return [0, 5000];
      }
      case prev[1] > 0: {
        return [-5000, 0];
      }
      case prev[1] < 0: {
        return [5000, 0];
      }
    }
    return [0,0];
  },[0,0])

  return (
    <div class="flex flex-col h-full w-full">
      <Show when={emptyDecks()?.length == 0 && !location.query.deckId}>
        <Suspense>
          <CreateDeck
            title="Create Deck"
            showModal={showModal()}
            cards={pokemons()}
            onClose={() => { toggleModal(false) }}
          />
        </Suspense>
      </Show>
      <Show when={emptyDecks()?.length != 0 && location.query.deckId}>
        <Suspense>
          <AddCards
            title="Add Cards to Deck"
            showModal={showModal()}
            deckId={location.query.deckId}
            onClose={() => { toggleModal(false) }}
          />
        </Suspense>
      </Show>
      <div class="flex relative justify-center items-center">
        <SearchBar search={searchParams.search} onChange={onSearch}/>
      </div>
      <FixedButton
        existingPokemonsLength={pokemonsInCurrentDeck()?.length ?? 0}
        onClick={() => toggleModal(true)}
      />
      <PaginationButtons
        onNextPage={goToNextPage}
        onPrevPage={goToPrevPage}
        showPrev={hasPrevPage()}
        showNext={hasNextPage()}
      />
      <div
        use:moveCards={{
          initial: { x: 0 },
          animate: { x: movingCards() },
          transition: {
            duration: 2,
            easing: "ease-out",
         },
        }}
      >
      <Suspense fallback={<Spinner/>}>
         <CardsGrid>
           <For each={cards()}>
             {(pokemon, index) => (
               <FlipCard
                 user={user()}
                 selectedPokemons={pokemons()}
                 pokemonsInDeck={pokemonsInCurrentDeck()}
                 keepFlipped={flipState()}
                 pokemon={pokemon}
               />
             )}
           </For>
         </CardsGrid>
       </Suspense>
      </div>
    </div>
  )
};

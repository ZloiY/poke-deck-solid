import { motion } from "@motionone/solid";
import { Location, useIsRouting } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For, lazy, Show, Suspense } from "solid-js";
import { refetchRouteData,
  RouteDataArgs,
  useLocation, useNavigate, useRouteData, useSearchParams, useServerContext } from "solid-start";
import { FlipCard } from "~/components/Cards/FlipCard";

import Check from "@icons/check.svg";

import { CardsGrid } from "~/components/CardsGrid";
import { PaginationButtons } from "~/components/PaginationButtons";
import { SearchBar } from "~/components/SearchBar";
import { Spinner } from "~/components/Spinner";
import { flipState } from "~/utils/flipStore";
import { pokemons } from "~/utils/selectedPokemonsStore";
import { cookieSessionStorage } from "~/utils/cookieSessionStorage";
import { appRouter } from "~/trpc/router";
import { prisma } from "~/db";
import { Pokemon, PokemonClient } from "pokenode-ts";
import { createServerData$ } from "solid-start/server";
import { useUser } from "~/actions/useUser";

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
           {20}
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
    return await useUser(request);
  });
  const cards = createServerData$(async (key, { request }) => {
    const session = await useUser(request);
    const pokemonApi = new PokemonClient();
    const caller = appRouter.createCaller({ session, prisma, pokemonApi })
    return await caller.pokemon
      .getPokemonList({ limit: 15, offset: +key[0] * 15, searchQuery: key[1] })
      .then((pokemons) => pokemons.map((pokemon) => {
        const { name, id, stats, height, weight, sprites, abilities } = pokemon;
        return {
          id,
          name,
          stats,
          height,
          weight,
          sprites,
          abilities
        } as Pokemon
      }
    ));
  },
  { key: () => [params.page, searchParams.search] });
  const pokemonsInCurrentDeck = createServerData$(async (key) => {
    const pokemonApi = new PokemonClient();
    const caller = appRouter.createCaller({ session: null, prisma, pokemonApi });
    return await caller.pokemon.getPokemonsByDeckId(key[0] ?? "");
  },
  { key: () => [searchParams.deckId] });
  return { emptyDecks, pokemonsInCurrentDeck, user, cards };
};

const totalLength = 1275;
const limit = 15;
const totalPages = Math.ceil(totalLength / limit);
export default function Home() {
  const { emptyDecks, pokemonsInCurrentDeck, user, cards } = useRouteData<typeof routeData>();
  const location = useLocation();
  const page = createMemo(() => getPage(location));

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
    const width = typeof window !== 'undefined' ? window.screen.width : 0;
    switch (true) {
      case paginationState() == "Next": {
        return [0, -(width * 2)];
      }
      case paginationState() == "Prev": {
        return [0, (width * 2)];
      }
      case prev[1] > 0: {
        return [-(width * 2), 0];
      }
      case prev[1] < 0: {
        return [(width * 2), 0];
      }
    }
    return [0,0];
  }, [0,0])

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
      <Show when={location.query.deckId}>
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
       <Suspense fallback={
         <div class="flex h-full w-full items-center justify-center">
           <Spinner className="mt-20 h-52 w-52"/>
         </div>}>
         <CardsGrid>
             <For each={cards()} fallback={<Spinner/>}>
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

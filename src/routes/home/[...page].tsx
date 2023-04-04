import { motion, Motion } from "@motionone/solid";
import { Location, useIsRouting } from "@solidjs/router";
import { animate } from "motion";
import { batch, createEffect, createMemo, createSignal, For } from "solid-js";
import { createRouteData, refetchRouteData,
  RouteDataArgs,
  useLocation, useNavigate, useRouteData, useSearchParams } from "solid-start";
import { FlipCard } from "~/components/Cards/FlipCard";

import { CardsGrid } from "~/components/CardsGrid";
import { PaginationButtons } from "~/components/PaginationButtons";
import { SearchBar } from "~/components/SearchBar";
import { Spinner } from "~/components/Spinner";
import { trpc } from "~/trpc/api";
import { flipState } from "~/utils/flipStore";
import { loadingState } from "~/utils/loadingStateStore";

type PaginationState = "Initial" | "Next" | "Prev";

const getPage = (location: Location) => {
  let page = +location.pathname.split('/')[2]
  if (Number.isNaN(page)) {
    page = 0;
  }
  return page;
}

export function routeData({ location }: RouteDataArgs) {
  const [searchParams] = useSearchParams();
  const page = createMemo(() => getPage(location));
  return createRouteData(async (key) => {
    const pokemons = await trpc.pokemon.getPokemonList.query({
      offset: +key[0]() * 15,
      limit: 15,
      searchQuery: key[1] as string,
    });
    return pokemons;
  },
  { key: () => [page, searchParams.search] });
};

const totalLength = 1275;
const limit = 15;
const totalPages = Math.ceil(totalLength / limit);
const log = (val, tag) => {
  console.log(tag);
  return val;
};
export default function Home() {
  const pokemons = useRouteData<typeof routeData>();
  const navigate = useNavigate();
  const location = useLocation();
  const isRouting = useIsRouting();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paginationState, setPaginationState] = createSignal<PaginationState>("Initial");
  const page = createMemo(() => getPage(location));
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
      <div class="flex relative justify-center items-center">
        <SearchBar search={searchParams.search} onChange={onSearch}/>
      </div>
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
       <CardsGrid>
         <For each={pokemons()} fallback={<Spinner/>}>
           {(pokemon, index) => (
             <FlipCard
               keepFlipped={flipState()}
               pokemon={pokemon}
             />
           )}
         </For>
       </CardsGrid>
      </div>
    </div>
  )
};

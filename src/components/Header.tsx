import { createSignal, Show } from "solid-js";
import { twMerge } from "tailwind-merge";

import LogoutIcon from "@icons/logout.svg";
import BurgerMenu from "@icons/menu-burger.svg";
import { HighlightedLink } from "./HighlightedLink";
import { FlipButton } from "./FlipButton";
import { createServerAction$, redirect } from "solid-start/server";
import { cookieSessionStorage } from "~/utils/cookieSessionStorage";

export const Header = (props: {user?: Session, showFlip?: boolean }) => {
  const [showNavMenu, toggleNavMenu] = createSignal(false);
  const [logOuting, logout] = createServerAction$(async (_, { request }) => {
    const session = await cookieSessionStorage.getSession(request.headers.get("Cookie"))
    return redirect("/", {
      headers: {
        "Set-Cookie": await cookieSessionStorage.destroySession(session),
      }
    })
  });

  return (
    <div
      class={twMerge(
        "w-full flex items-center justify-between bg-purple-900 py-5 mb-10 px-6 text-4xl",
        "shadow-lg shadow-purple-700/75 sticky top-0 z-50",
        showNavMenu() && "relative",
      )}
    >
      <Show when={props.user?.id}>
        <div
            role="button"
            class="text-white lg:hidden cursor-pointer
        hover:text-yellow-400 active:text-yellow-500 active:scale-90"
            onClick={() => toggleNavMenu(true)}
          >
            <BurgerMenu class="min-[580px]:w-20 min-[580px]:h-20 h-14 w-14" />
          </div>
          <div
            class={twMerge(
              "gap-10 items-center lg:flex hidden",
              showNavMenu() &&
                "absolute top-0 left-0 h-[100vh] w-[100vw] flex flex-col justify-center bg-purple-900 z-[100]",
            )}
            onClick={() => toggleNavMenu(false)}
          >
            <HighlightedLink href="/home">Home</HighlightedLink>
            <HighlightedLink href="/decks">Decks</HighlightedLink>
            <HighlightedLink href="/pokemons">Pókemons</HighlightedLink>
        </div>
        <div class="flex gap-4 items-center">
          <Show when={props.showFlip}>
            <FlipButton />
          </Show>
          <span class="min-[580px]:text-6xl lg:text-4xl text-2xl">
            Hello, {props.user?.name}!
          </span>
          <LogoutIcon
            role="button"
            class="lg:w-8 lg:h-8 min-[580px]:w-14 min-[580px]:h-14 w-10 h-10 stroke-white hover:stroke-yellow-400 active:stroke-yellow-500 cursor-pointer"
            onClick={logout}
          />
        </div>
      </Show>
      <Show when={!props.user?.id}>
        <HighlightedLink href="/login">Sign In</HighlightedLink>
      </Show>
    </div>
  );
};

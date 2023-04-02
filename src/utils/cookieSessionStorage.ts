import { createCookieSessionStorage } from "solid-start";

export const cookieSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "poke-deck-solid",
    secure: import.meta.env.NODE_ENV === "production",
    secrets: [import.meta.env.AUTH_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    httpOnly: true,
  }
});

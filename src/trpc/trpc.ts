import { PokemonClient } from "pokenode-ts";
import superjson from "superjson";
import { redirect } from "solid-start";
import { ZodError } from "zod";

import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import { prisma } from ".././db/index";
import { cookieSessionStorage } from "src/utils/cookieSessionStorage";

const pokemonApi = new PokemonClient();

type CreateContextOptions = {
  session: Session | null;
};

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    pokemonApi,
  };
};


export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req, resHeaders } = opts;
  let session: Session | null = null;
  const sessionStorage = await cookieSessionStorage.getSession(req.headers.get("Cookie"));
  const id = sessionStorage.get("id");
  const name = sessionStorage.get("name");
  if (id && name) {
    session = {
      id,
      name,
    }
  }

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code == "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw redirect("/home");
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const mergeRoutes = t.mergeRouters;


import { v4 } from "uuid";
import { z } from "zod";

import type { Deck, User } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const deckRouter = createTRPCRouter({
  createDeck: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(20),
        private: z.boolean(),
        cards: z
          .object({ name: z.string(), imageUrl: z.string() })
          .array()
          .nullish(),
      })
    )
    .mutation(
      async ({ input, ctx }): Promise<Message & { deck: Deck | undefined }> => {
        const userId = ctx.session.user.id;
        const { cards, private: privateDeck, name } = input;
        if (cards && cards.length > 0) {
          try {
            const deck = await ctx.prisma.deck.create({
              data: {
                userId,
                name,
                private: privateDeck,
                isEmpty: false,
                isFull: +import.meta.env.DECK_MAX_SIZE == cards.length,
                deckLength: cards.length,
                deck: {
                  create: cards,
                },
              },
            });
            return {
              id: v4(),
              state: "Success",
              message: `Deck ${input.name} was created successfully`,
              deck,
            };
          } catch (err) {
            console.error("deck creation error", err);
            return {
              id: v4(),
              state: "Failure",
              message: `Couldn't create ${input.name} deck`,
              deck: undefined,
            };
          }
        } else {
          try {
            const deck = await ctx.prisma.deck.create({
              data: {
                userId: userId,
                name,
                private: privateDeck,
                isEmpty: true,
                isFull: false,
                deckLength: 0,
              },
            });
            return {
              id: v4(),
              state: "Success",
              message: `Deck ${input.name} was created successfully`,
              deck,
            };
          } catch (err) {
            console.error("deck creation error", err);
            return {
              id: v4(),
              state: "Failure",
              message: `Couldn't create ${input.name} deck`,
              deck: undefined,
            };
          }
        }
      }
    ),
  getUserDeckById: protectedProcedure
    .input(
      z.object({
        deckId: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const deckId = input.deckId;
      if (deckId) {
        const deck = await ctx.prisma.deck.findUnique({
          where: {
            id: deckId,
          },
        });
        return deck;
      }
      return null;
    }),
  getEmptyUserDecks: protectedProcedure
    .input(
      z.object({
        numberOfEmptySlots: z.number().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const numberOfSlots =
        input.numberOfEmptySlots ?? +import.meta.env.DECK_MAX_SIZE;
      const userId = ctx.session.id;
      const decks = await ctx.prisma.deck.findMany({
        where: {
          userId,
          deckLength: {
            lte: +import.meta.env.DECK_MAX_SIZE - numberOfSlots,
          },
        },
      });
      return decks;
    }),
  getUserDecks: protectedProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(20).nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? +import.meta.env.USER_MAX_DECKS;
      const cursor = input.cursor ? { id: input.cursor } : undefined;
      const userId = ctx.session.user.id;
      const decks = await ctx.prisma.deck.findMany({
        where: {
          userId,
        },
        cursor,
        take: limit + 1,
      });
      let nextCursor = undefined;
      if (decks.length > limit) {
        nextCursor = decks.pop()?.id;
      }
      return {
        decks,
        nextCursor,
      };
    }),
  getOthersUsersDecks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit;
      const cursor = input.cursor ? { id: input.cursor } : undefined;
      const userId = ctx.session.user.id;
      const decks: (Deck & { user: User })[] = await ctx.prisma.deck.findMany({
        where: {
          userId: {
            not: userId,
          },
          private: false,
        },
        include: {
          user: true,
        },
        cursor,
        take: limit + 1,
      });
      const decksLength = await ctx.prisma.deck.count();
      let nextCursor = undefined;
      if (decks.length > limit) {
        nextCursor = decks.pop()?.id;
      }
      return {
        decks: decks.map((deck) => {
          const { user, ...deckParams } = deck;
          return { ...deckParams, username: user.name };
        }),
        decksLength,
        nextCursor,
      };
    }),
  getDeckById: protectedProcedure
    .input(z.string())
    .query(async ({ input: deckId, ctx }) => {
      const deck: (Deck & { user: User }) | null =
        await ctx.prisma.deck.findUnique({
          where: {
            id: deckId,
          },
          include: {
            user: true,
          },
        });
      if (deck) {
        const { user, ...deckParams } = deck;
        return { ...deckParams, username: user.name };
      }
    }),
  removeUserDeck: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }): Promise<Message> => {
      try {
        await ctx.prisma.deck.delete({
          where: {
            id: input,
          },
        });
        return {
          id: v4(),
          state: "Success",
          message: "Deck was successfully removed",
        };
      } catch (err) {
        console.error("Error during removing deck", err);
        return {
          id: v4(),
          state: "Failure",
          message: "Couldn't remove the deck",
        };
      }
    }),
  addCardsToDecks: protectedProcedure
    .input(
      z.object({
        decksIds: z.string().array(),
        cards: z
          .object({
            name: z.string(),
            imageUrl: z.string(),
          })
          .array(),
      })
    )
    .mutation(async ({ input, ctx }): Promise<Message> => {
      try {
        const decks = await ctx.prisma.deck.findMany({
          where: {
            OR: input.decksIds.map((id) => ({
              id,
            })),
          },
        });
        await Promise.all(
          decks
            .filter(
              (deck) =>
                !deck.isFull &&
                deck.deckLength + input.cards.length <=
                  Number(import.meta.env.DECK_MAX_SIZE)
            )
            .map(
              async (deck) =>
                await ctx.prisma.deck.update({
                  where: {
                    id: deck.id,
                  },
                  data: {
                    isEmpty: false,
                    isFull:
                      deck.deckLength + input.cards.length ==
                      Number(import.meta.env.DECK_MAX_SIZE),
                    deckLength: deck.deckLength + input.cards.length,
                    deck: { create: input.cards },
                  },
                })
            )
        );
        return {
          id: v4(),
          state: "Success",
          message: "Card(s) where successfully added to the deck(s)",
        };
      } catch (err) {
        console.error("Error during adding cards to deck", err);
        return {
          id: v4(),
          state: "Failure",
          message: "Something went wrong...( Please try again later",
        };
      }
    }),
});

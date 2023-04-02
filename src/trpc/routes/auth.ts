import sha256 from "crypto-js/sha256";
import { v4 } from "uuid";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const alphabet = [
  [33, 38],
  [48, 57],
  [60, 90],
  [97, 122],
] as const;

const passwordRegEx = /[\w(@|#|$|&)+]{8}/g;

const saltGeneration = () => {
  const charAlphabet = alphabet
    .map(([firstCharCode, lastCharCode]) => {
      let currentCharCode: number = firstCharCode;
      const chars: string[] = [];
      while (currentCharCode != lastCharCode) {
        chars.push(String.fromCharCode(currentCharCode));
        currentCharCode++;
      }
      return chars;
    })
    .flat();
  const saltLength = Array.from(
    Array(Math.floor(Math.random() * (10 - 6) + 6)).keys()
  );
  return saltLength
    .map(
      () => charAlphabet[Math.floor(Math.random() * (charAlphabet.length - 1))]
    )
    .join("");
};

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().regex(passwordRegEx),
        repeatPassword: z.string().regex(passwordRegEx),
      })
    )
    .mutation(async ({ input, ctx }): Promise<Message> => {
      if (input.password !== input.repeatPassword) {
        return {
          id: v4(),
          state: "Failure",
          message: "Password are not the same",
        };
      }
      const salt = saltGeneration();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const hash: string = sha256(`${input.password}${salt}`).toString();
      try {
        const user = await ctx.prisma.user.create({
          data: {
            name: input.username,
            salt,
            hash,
          },
        });
        return {
          id: v4(),
          state: "Success",
          message: "User successfully created",
        };
      } catch (prismaError) {
        console.log("User create error: ", prismaError);
        return {
          id: v4(),
          state: "Failure",
          message: "Something went wrong...",
        };
      }
    }),
});

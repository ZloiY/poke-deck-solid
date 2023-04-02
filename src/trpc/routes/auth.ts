import sha256 from "crypto-js/sha256";
import { v4 } from "uuid";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const alphabet = [
  [33, 38],
  [48, 57],
  [60, 90],
  [97, 122],
].map(([firstCharCode, lastCharCode]) => {
  let currentCharCode: number = firstCharCode;
  const chars: string[] = [];
  while (currentCharCode != lastCharCode) {
    chars.push(String.fromCharCode(currentCharCode));
    currentCharCode++;
  }
  return chars;
}).flat();

const passwordRegEx = /^[\w]+(!|\$|#|@|&)+$/g;

const saltGeneration = () => {
  const saltLength = Array.from(
    Array(Math.floor(Math.random() * (10 - 6) + 6)).keys()
  );
  return saltLength
    .map(
      () => alphabet[Math.floor(Math.random() * (alphabet.length - 1))]
    )
    .join("");
};

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(8).max(16).regex(passwordRegEx),
        repeatPassword: z.string().regex(passwordRegEx),
      })
    )
    .mutation(async ({ input, ctx }): Promise<Message> => {
      if (input.password !== input.repeatPassword) {
        return {
          id: v4(),
          state: "Failure",
          message: "Passwords are not the same",
        };
      }
      const salt = saltGeneration();
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

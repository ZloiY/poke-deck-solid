import sha256 from "crypto-js/sha256";
import { redirect } from "solid-start/server";
import { v4 } from "uuid";
import { cookieSessionStorage } from "~/utils/cookieSessionStorage";
import { prisma } from "../db";

export const useLogin = async (validatedCreds: { username: string, password: string }) => {
  try {
    const user = await prisma.user
      .findUniqueOrThrow({
        where: { name: validatedCreds.username },
    });
    const hash: string = sha256(`${validatedCreds.password}${user?.salt}`).toString();
    if (hash == user.hash) {
      const session = await cookieSessionStorage.getSession();
      session.set("id", user.id);
      session.set("name", user.name);
      return redirect("/home", {
        headers: {
          "Set-Cookie": await cookieSessionStorage.commitSession(session),
        }
      })
    } else {
      return {
        id: v4(),
        state: "Failure",
        message: "Wrong credentials",
      } as Message;
    }
  } catch (prismaError) {
    console.log("Couldn't find user", prismaError);
    return {
      id: v4(),
      state: "Failure",
      message: "User doesn't exist",
    } as Message;
  }
}

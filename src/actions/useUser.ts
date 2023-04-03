import { prisma } from "~/db";
import { cookieSessionStorage } from "~/utils/cookieSessionStorage";

export const useUser = async (request: Request) => {
  const session = await cookieSessionStorage.getSession(request.headers.get("Cookie"));
  const id = session.get("id");
  const name = session.get("name");
  return { id, name };
};

export const useFullUser = async (request: Request) => {
  const { id } = await useUser(request); 
  const user = await prisma.user.findUnique({
    where: { id, },
    include: { decks: true },
  });
  return {
    id,
    name: user?.name,
    numberOfDecks: user?.decks.length,
  }
}

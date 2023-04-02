import sha256 from "crypto-js/sha256";
import { v4 } from "uuid";
import { prisma } from "~/db";

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

export const useRegistration = async (validatedCreds: {
    username: string,
    password: string,
    repeatPassword: string
}): Promise<Message> => {
  if (validatedCreds.password !== validatedCreds.repeatPassword) {
    return {
      id: v4(),
      state: "Failure",
      message: "Passwords are not the same",
    };
  }
  const salt = saltGeneration();
  const hash: string = sha256(`${validatedCreds.password}${salt}`).toString();
  try {
    const user = await prisma.user.create({
      data: {
        name: validatedCreds.username,
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
}

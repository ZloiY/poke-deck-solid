import { createEffect } from "solid-js";
import { A } from "@solidjs/router";
import sha256 from "crypto-js/sha256";
import { v4 } from "uuid";
import { z } from "zod";
import { FormError } from "solid-start/data";
import {
  createServerAction$, redirect,
} from "solid-start/server";

import { prisma } from "~/db";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Layout } from "~/components/layouts/Layout";
import { Welcome } from "~/components/Welcome";
import { cookieSessionStorage } from "~/utils/cookieSessionStorage";
import { useLogin } from "~/utils/useLogin";

export default function Login() {
  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const username = form.get("username");
    const password = form.get("password");
    const fields = {
      username,
      password
    };
    const validatedCreds = z.object({
      username: z.string()
        .min(3, { message: "Username should at least contain 3 chars" })
        .max(12, { message: "Username shouldn't be longer than 12 chars" }),
      password: z.string()
        .min(8, { message: "Password should be at least has 6 symbols" })
        .max(16, { message: "Password can't be longer than 16 symbols" })
        .regex(/[\w(@|#|$|&|!)+]{8}/,
        { message: `Password should contain letters, numbers and at least one of this
        '@', '#', '$', '&', '!'` })
    }).safeParse(fields);
    if (validatedCreds.success) {
      return await useLogin(validatedCreds.data);
    } else {
      const fieldErrors = validatedCreds.error.issues.reduce((errs, error) => ({
        ...errs,
        [error.path[0]]: error.message,
      }), { username: "", password: "" })
      throw new FormError("Fields invalid", { fieldErrors, fields });
    }
  });

  createEffect(() => {
    if (loggingIn.result && loggingIn.result.state == "Failure") {
    }
  }, loggingIn.result)

  return (
   <Layout title="PokeDek LogIn">
     <div class="h-full flex flex-col justify-center items-center w-full">
      <Welcome/>
      <div class="flex items-center justify-center relative w-full">
        <div class="flex items-center justify-center w-full">
        <Form class="flex flex-col gap-5 sm:rounded-lg text-xl bg-purple-900 p-5 
              sm:shadow-[0px_0px_20px_5px] sm:shadow-zinc-600/50 w-full max-w-2xl
              shadow-none rounded-none">
          <Input
            id="username"
            label="Username:"
            name="username"
            error={loggingIn.error?.fieldErrors?.username}
            labelStyles="text-2xl"
            errorStyles="text-lg"
            inputStyles="text-2xl h-14"
          />
          <Input
            id="password"
            type="password"
            name="password"
            label="Password:"
            error={loggingIn.error?.fieldErrors?.password}
            labelStyles="text-2xl"
            errorStyles="text-lg"
            inputStyles="text-2xl h-14"
          />
          <Button
            className="text-2xl py-2 h-12"
            isLoading={loggingIn.pending}
            disabled={loggingIn.pending}
            type="submit"
          >
           Log In 
          </Button>
          <span>
          Don&apos;t have account?
          <A href="/registration"
          class="ml-1 text-blue-300 underline hover:text-yellow-400">
            Create one!
          </A>
          </span>
        </Form>
        </div>
      </div>
    </div>
  </Layout>
  );
}

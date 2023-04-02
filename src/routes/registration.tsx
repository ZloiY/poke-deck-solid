import { createEffect } from "solid-js";
import { A,  FormError } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { z } from "zod";

import { useLogin } from "~/actions/useLogin";
import { useRegistration } from "~/actions/useRegistration";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Layout } from "~/components/layouts/Layout";
import { Welcome } from "~/components/Welcome";

export default function Registration() {
  const [signinigUp, { Form }] = createServerAction$(async (form: FormData) => {
    const fields = {
      username: form.get("username"),
      password: form.get("password"),
      repeatPassword: form.get("repeatPassword"),
    };
    const validatedCreds = z.object({
        username: z.string().min(3),
        password: z.string().min(8).max(16).regex(/^[\w]+(!|\$|#|@|&)+$/),
        repeatPassword: z.string().regex(/^[\w]+(!|\$|#|@|&)+$/),
      }).safeParse(fields);
    if (validatedCreds.success) {
      return await useRegistration(validatedCreds.data);
    } else {
      const fieldErrors = validatedCreds.error.issues.reduce((errs, error) => ({
        ...errs,
        [error.path[0]]: error.message,
      }), { username: "", password: "", repeatPassword: "" })
      throw new FormError("Fields invalid", { fieldErrors, fields });
    }
  });

  const [signininIn, singIn] = createServerAction$(useLogin);

  createEffect(() => {
    if (signinigUp.result?.state == "Success") {
      const fields = {
        username: signinigUp.input?.get("username")?.toString() ?? "",
        password: signinigUp.input?.get("password")?.toString() ?? "",
      };
     singIn(fields)
       .then((maybeMessage) => {
       });
    }
  }, signinigUp.result)

  return (
    <Layout title="PokeDeck Registration">
      <div class="flex flex-col h-full w-full justify-center items-center">
        <Welcome/>
        <div class="flex w-full items-center justify-center font-fredoka relative">
        <Form
          class="flex flex-col gap-5 sm:rounded-lg text-xl bg-purple-900 p-5 
              sm:shadow-[0px_0px_20px_5px] sm:shadow-zinc-600/50 w-full max-w-2xl
              rounded-none shadow-none"
        >
          <Input
            id="username"
            name="username"
            label="Username:"
            error={signinigUp.error?.fieldErrros?.username}
            labelStyles="text-2xl"
            inputStyles="text-2xl h-14"
            errorStyles="text-lg"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password:"
            error={signinigUp.error?.fieldErrros?.password}
            labelStyles="text-2xl"
            inputStyles="text-2xl h-14"
            errorStyles="text-lg"
          />
          <Input
            id="repeatPassword"
            name="repeatPassword"
            type="password"
            label="Repeat Password:"
            error={signinigUp.error?.fieldErrros?.repeatPassword}
            labelStyles="text-2xl"
            inputStyles="text-2xl h-14"
            errorStyles="text-lg"
          />
          <Button
            className="text-2xl h-12"
            type="submit"
            isLoading={signinigUp.pending || signininIn.pending}
            disabled={signinigUp.pending || signininIn.pending}
          >
            Register
          </Button>
          <span>
            Already have account?
            <A
              href="/login"
              class="ml-1 text-blue-300 underline hover:text-yellow-400"
            >
              Log in!
            </A>
          </span>
        </Form>
      </div>
    </div>
  </Layout>
  );
};

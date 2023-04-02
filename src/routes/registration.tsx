import { A } from "solid-start";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Layout } from "~/components/layouts/Layout";
import { Welcome } from "~/components/Welcome";

export default function Registration() {
  return (
    <Layout title="PokeDeck Registration">
      <div class="flex flex-col h-full w-full justify-center items-center">
        <Welcome/>
        <div class="flex w-full items-center justify-center font-fredoka relative">
        <form
          class="flex flex-col gap-5 sm:rounded-lg text-xl bg-purple-900 p-5 
              sm:shadow-[0px_0px_20px_5px] sm:shadow-zinc-600/50 w-full max-w-2xl
              rounded-none shadow-none"
        >
          <Input
            id="username"
            label="Username:"
            labelStyles="text-2xl"
            inputStyles="text-2xl h-14"
            errorStyles="text-lg"
          />
          <Input
            id="password"
            type="password"
            label="Password:"
            labelStyles="text-2xl"
            inputStyles="text-2xl h-14"
            errorStyles="text-lg"
          />
          <Input
            id="repeatPassword"
            type="password"
            label="Repeat Password:"
            labelStyles="text-2xl"
            inputStyles="text-2xl h-14"
            errorStyles="text-lg"
          />
          <Button
            className="text-2xl h-12"
            type="submit"
            isLoading={false}
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
        </form>
      </div>
    </div>
  </Layout>
  );
};

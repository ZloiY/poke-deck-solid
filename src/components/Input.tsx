import { createSignal, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import EyeClose from "@icons/eye-close.svg";
import EyeOpen from "@icons/eye-open.svg";

interface InputProps extends HTMLInputElement {
  error?: string;
  label?: string;
  containerStyle?: string;
  labelStyles?: string;
  inputStyles?: string;
  errorStyles?: string;
};

export const Input = (props: InputProps) => {
  const [isPasswordVisible, setPassword] = createSignal(false);
  const [local, others] = splitProps(props,
    ["error", "label", "type", "containerStyle", "labelStyles", "inputStyles", "errorStyles"])
  const [derivedType, setType] = createSignal(local.type);
  const showPassword = () => {
    setPassword(true);
    setType("text");
  };
  const hidePassword = () => {
    setPassword(false);
    setType("password");
  }

  return (
    <div class={twMerge("flex flex-col gap-1", local.containerStyle)}>
      <Show when={!!local.label}>
        <label
          for={others.name}
          class={twMerge("text-lg font-medium", local.labelStyles)}
        >
          {local.label}
        </label>
      </Show>
      <div class="relative w-full">
        <input
          type={derivedType()}
          {...others}
          class={twMerge(
            `rounded-md border-2 border-white py-1 px-2 text-black outline-none text-lg w-full
        hover:shadow-zinc-300/50
        focus:shadow-lg focus:shadow-yellow-300/50 focus:border-yellow-500`,
            props.error && "border-red-500 bg-red-400 bg-opacity-50",
            props.inputStyles,
          )}
        />
        <Show when={local.type == "password"}>
          <div class="absolute h-full w-1/12 top-0 right-0 pr-2 text-black transition-opacity duration-200">
            <EyeOpen
              class={twMerge(
                "absolute h-full w-full py-2 pr-2 top-0 cursor-pointer ml-auto transition-opacity duration-200",
                isPasswordVisible() ? "opacity-100 z-10" : "opacity-0", 
              )}
              onClick={hidePassword}
            />
            <EyeClose
              class={twMerge(
                "absolute py-2 pr-2 h-full w-full top-0 cursor-pointer ml-auto transition-opacity duration-200",
                isPasswordVisible() ? "opacity-0" : "opacity-100",
              )}
              onClick={showPassword}
            />
          </div>
        </Show>
      </div>
      <Show when={local.error}>
        <span class={twMerge("text-sm text-red-500", local.errorStyles)}>
          {local.error}
        </span>
      </Show>
    </div>
  )
};

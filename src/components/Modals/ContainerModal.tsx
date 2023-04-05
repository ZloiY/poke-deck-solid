import { spring } from "motion";
import { children, createEffect, createSignal, JSX, Show } from "solid-js";
import { twMerge } from "tailwind-merge";

import { motion, Presence } from "@motionone/solid";
import Close from "@icons/close.svg";

export const ContainerModal = (props: {
  children: JSX.Element,
  showModal: boolean,
  onClose: () => void,
  title?: string,
}) => {
  const modalMotion = motion;

  return (
  <Presence>
    <Show when={props.showModal}>
      <div
        use:modalMotion={{
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0 },
          transition: { easing: spring({ stiffness: 100 }) }
        }}
        class="backdrop-blur p-0 fixed inset-0 z-[100] flex justify-center items-center"
      >
        <dialog
          class={twMerge("p-0 flex bg-transparent",
            props.title && `bg-purple-900 text-white rounded-xl flex flex-col
            shadow-[0_0_20px_5px] shadow-purple-500 transition-opacity`,
          )}
        >
         <div class="relative">
           <Show when={props.title}>
             <div class="flex justify-between mb-2 p-3 border-b-2 border-yellow-500">
              <span class="text-2xl font-coiny">{props.title}</span>
              <div
                role="button"
                onClick={props.onClose}
              >
                <Close
                  class="cursor-pointer w-8 h-8 hover:text-yellow-400"
                />
              </div>
            </div>
           </Show>
           {props.children}
         </div>
        </dialog>
      </div>
    </Show>
  </Presence>
  );
};

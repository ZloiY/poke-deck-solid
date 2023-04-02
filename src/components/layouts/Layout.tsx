import { children, JSXElement } from "solid-js";
import { Title } from "solid-start";

interface LayoutProps {
  children: JSXElement;
  title: string;
}

export const Layout = (props: LayoutProps) => {
  const c = children(() => props.children);
  return (
    <main class="bg-purple-500 h-full w-full relative overflow-y-scroll">
      <Title>{props.title}</Title>
      {c()}
    </main>
  )
};

import { children, JSX, Suspense } from "solid-js";
import { Header } from "../Header";
import { Layout } from "./Layout";

export const HeaderLayout = (props: {
  title: string,
  showFlip?: boolean,
  user?: Session,
  children?: JSX.Element,
}) => {
  const c = children(() => props.children);
  return (
    <Layout title={props.title}>
      <Suspense fallback={<div class="h-20 bg-purple-900"/>}>
        <Header showFlip={props.showFlip} user={props.user}/>
      </Suspense>
      {c()}
    </Layout>
  );
};

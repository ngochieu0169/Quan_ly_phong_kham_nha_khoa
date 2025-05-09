import TheFooter from "../footer";
import TheHeader from "../header";

function Container({ children }: any) {
  return (
    <div>
      <TheHeader />
      <div>{children}</div>
      <TheFooter />
    </div>
  );
}

export default Container;

import TheHeader from "../header";

function Container({ children }: any) {
  return (
    <div>
      <TheHeader />
      <div className="content">{children}</div>
    </div>
  );
}

export default Container;

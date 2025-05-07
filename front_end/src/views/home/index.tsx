// import { useLayoutEffect } from "react";
// import { useDispatch } from "react-redux";
import TheBanner from "../../components/banner";

function HomePage() {
  // const dispath = useDispatch();
//   useLayoutEffect(() => {
//     handleFetchData();
//   }, []);


  return (
    <div>
      <TheBanner/>
      <section className="home-page">
        home page
      </section>
    </div>
  );
}

export default HomePage;

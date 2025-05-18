import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Container from "./components/layout/Container";
import ContainerManager from "./components/layout/ContainerManager";
import { publicRoutes, privateRoutes } from "./router";
import NotFoundPage from "./views/errors";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* this will render list route in router > index.ts */}
          {publicRoutes.map((route: any) => {
            const Page = route.component;
            return (
              <Route
                key={route.name}
                path={route.path}
                element={
                  <Container>
                    <Page />
                  </Container>
                }
              />
            );
          })}
          {privateRoutes.map((route, index) => {
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <ContainerManager>
                    <Page />
                  </ContainerManager>
                }
              />
            );
          })}
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />{" "}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

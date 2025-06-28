import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Container from "./components/layout/Container";
import ContainerManager from "./components/layout/ContainerManager";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { publicRoutes, privateRoutes } from "./router";
import NotFoundPage from "./views/errors";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "./store/user";

function App() {
  const dispatch = useDispatch();

  // Khởi tạo user state từ localStorage khi app start
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const userObj = JSON.parse(saved);
        if (userObj.tenTaiKhoan) {
          dispatch(updateUser(userObj));
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* this will render list route in router > index.ts */}
          {publicRoutes.map((route: any) => {
            const Page = route.component;
            return (
              <Route
                key={`public-${route.name || route.path}`}
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
                key={`private-${route.name || route.path || index}`}
                path={route.path}
                element={
                  <ProtectedRoute>
                    <ContainerManager>
                      <Page />
                    </ContainerManager>
                  </ProtectedRoute>
                }
              />
            );
          })}
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </Router>
  );
}

export default App;

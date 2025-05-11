// import { ALBUMS, TOPALBUMS } from "../constants";

import LoginPage from "../views/auth/login";
import PersonalPage from "../views/auth/personal";
import RegisterPage from "../views/auth/register";
import HomePage from "../views/home";
import BookingPage from "../views/home/bookingPage";


const publicRoutes = [
  { name: "home",
    path: "/",
    component: HomePage,
  },
  { name: "booking",
    path: "/booking",
    component: BookingPage,
  },
  {
    name: "login",
    path: "/login",
    component: LoginPage,
  },
  {
    name: "register",
    path: "/register",
    component: RegisterPage,
  },

  // {
  //   name: "album_detail",
  //   path: "/album/:id",
  //   component: AlbumPage,
  // },
 
];

const privateRoutes = [
  {
    path: "/user",
    component: PersonalPage
  },

  // {
  //   name: "register",
  //   path: "/register",
  //   component: RegisterPage,
  // },
];

export { publicRoutes, privateRoutes };

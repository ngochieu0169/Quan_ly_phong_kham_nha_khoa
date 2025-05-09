// import { ALBUMS, TOPALBUMS } from "../constants";

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

  // {
  //   name: "album_detail",
  //   path: "/album/:id",
  //   component: AlbumPage,
  // },
 
];

const privateRoutes = [
  // {
  //   path: "/customer",
  //   component: CustomerPage
  // },
  {
    name: "login",
    path: "/login",
    component: '',
  },
  // {
  //   name: "register",
  //   path: "/register",
  //   component: RegisterPage,
  // },
];

export { publicRoutes, privateRoutes };

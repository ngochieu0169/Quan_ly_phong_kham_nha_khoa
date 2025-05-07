// import { ALBUMS, TOPALBUMS } from "../constants";

import HomePage from "../views/home";


const publicRoutes = [
  { name: "home",
    path: "/",
    component: HomePage,
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

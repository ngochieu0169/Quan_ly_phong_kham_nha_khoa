// import { ALBUMS, TOPALBUMS } from "../constants";

import AccountManager from "../views/admin/accountManagerPage";
import ClinicManagerPage from "../views/admin/clinicManagerPage";
import DoctorProfile from "../views/auth/doctorProfile";
import DoctorShiftCalendar from "../views/auth/doctorShiftCalendar";
import LoginPage from "../views/auth/login";
import MyPatients from "../views/auth/myPatien";
import NotificationPage from "../views/auth/notifycation";
import PersonalPage from "../views/auth/personal";
import RegisterPage from "../views/auth/register";
import RegisterShiftPage from "../views/auth/registerShiftPage";
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
  {
    name: "clinic",
    path: "/clinic",
    component: ClinicManagerPage,
  },
  {
    name: "account",
    path: "/account",
    component: AccountManager,
  },

  {
    name: "doctor",
    path: "/doctor/profile",
    component: DoctorProfile,
  },
  {
    name: "doctor",
    path: "/doctor/my-shifts",
    component: DoctorShiftCalendar,
  },
  {
    name: "patients",
    path: "/doctor/patients",
    component: MyPatients,
  },
  {
    name: "regis shift",
    path: "/doctor/regis-shift",
    component: RegisterShiftPage,
  },
  {
    name: "noti",
    path: "/notification",
    component: NotificationPage,
  },

  // {
  //   name: "register",
  //   path: "/register",
  //   component: RegisterPage,
  // },
];

export { publicRoutes, privateRoutes };

// import { ALBUMS, TOPALBUMS } from "../constants";

import AccountManager from "../views/admin/accountManagerPage";
import ClinicManagerPage from "../views/admin/clinicManagerPage";
import ScheduleManagerPage from "../views/admin/scheduleManagerPage";
import ShiftManagerPage from "../views/admin/shiftManagerPage";
import BillManagerPage from "../views/admin/billManagerPage";
import ServiceManagerPage from "../views/admin/serviceManagerPage";
import AdminDashboard from "../views/admin";
import DoctorProfile from "../views/auth/doctorProfile";
import DoctorShiftCalendar from "../views/auth/doctorShiftCalendar";
import LoginPage from "../views/auth/login";
import MyPatients from "../views/auth/myPatien";
import MyAppointments from "../views/auth/myAppointments";
import MyBills from "../views/auth/myBills";
import NotificationPage from "../views/auth/notifycation";
import PersonalPage from "../views/auth/personal";
import RegisterPage from "../views/auth/register";
import RegisterShiftPage from "../views/auth/registerShiftPage";
import RedirectPage from "../views/auth/redirect";
import HomePage from "../views/home/homePage";
import BookingPage from "../views/home/bookingPage";
import ClinicsPage from "../views/home/clinicsPage";
import ServicesPage from "../views/home/servicesPage";

// Receptionist imports
import ReceptionistDashboard from "../views/receptionist";
import ReceptionistAppointments from "../views/receptionist/appointments";
import CreateAppointment from "../views/receptionist/appointments/create";
import ReceptionistCheckin from "../views/receptionist/checkin";
import ReceptionistPatients from "../views/receptionist/patients";
import ReceptionistBilling from "../views/receptionist/billing";
import ReceptionistShifts from "../views/receptionist/shifts";
import ReceptionistMedicalRecords from "../views/receptionist/medical-records";
import ReceptionistNotifications from "../views/receptionist/notifications";
import DoctorScheduleManager from "../views/receptionist/doctorSchedule";
import PendingAssignments from "../views/receptionist/assignments";

// Owner imports
import OwnerDashboard from "../views/owner";
import ClinicInfo from "../views/owner/clinicInfo";
import StaffManagement from "../views/owner/staff";
import RevenueManagement from "../views/owner/revenue";
import AppointmentManagement from "../views/owner/appointments";
import OwnerRedirect from "../views/owner/redirect";


const publicRoutes = [
  {
    name: "redirect",
    path: "/",
    component: RedirectPage,
  },
  {
    name: "home",
    path: "/home",
    component: HomePage,
  },
  {
    name: "booking",
    path: "/booking",
    component: BookingPage,
  },
  {
    name: "clinics",
    path: "/clinics",
    component: ClinicsPage,
  },
  {
    name: "services",
    path: "/services",
    component: ServicesPage,
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
    name: "profile",
    path: "/profile",
    component: PersonalPage
  },
  {
    name: "admin dashboard",
    path: "/admin/dashboard",
    component: AdminDashboard,
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
    name: "schedule",
    path: "/schedule",
    component: ScheduleManagerPage,
  },
  {
    name: "shift",
    path: "/shift",
    component: ShiftManagerPage,
  },
  {
    name: "bill",
    path: "/bill",
    component: BillManagerPage,
  },
  {
    name: "service",
    path: "/service",
    component: ServiceManagerPage,
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
    name: "my-appointments",
    path: "/my-appointments",
    component: MyAppointments,
  },
  {
    name: "my-bills",
    path: "/my-bills",
    component: MyBills,
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

  // Receptionist routes
  {
    name: "receptionist",
    path: "/le-tan",
    component: ReceptionistDashboard,
  },
  {
    name: "receptionist appointments",
    path: "/le-tan/appointments",
    component: ReceptionistAppointments,
  },
  {
    name: "create appointment",
    path: "/le-tan/appointments/create",
    component: CreateAppointment,
  },
  {
    name: "receptionist checkin",
    path: "/le-tan/checkin",
    component: ReceptionistCheckin,
  },
  {
    name: "receptionist patients",
    path: "/le-tan/patients",
    component: ReceptionistPatients,
  },
  {
    name: "receptionist billing",
    path: "/le-tan/billing",
    component: ReceptionistBilling,
  },
  {
    name: "receptionist shifts",
    path: "/le-tan/shifts",
    component: ReceptionistShifts,
  },
  {
    name: "doctor schedule manager",
    path: "/le-tan/doctor-schedule",
    component: DoctorScheduleManager,
  },
  {
    name: "receptionist medical records",
    path: "/le-tan/medical-records",
    component: ReceptionistMedicalRecords,
  },
  {
    name: "receptionist notifications",
    path: "/le-tan/notifications",
    component: ReceptionistNotifications,
  },
  {
    name: "pending assignments",
    path: "/le-tan/assignments",
    component: PendingAssignments,
  },

  // Owner routes
  {
    name: "owner dashboard",
    path: "/owner",
    component: OwnerDashboard,
  },
  {
    name: "clinic info",
    path: "/owner/clinic-info",
    component: ClinicInfo,
  },
  {
    name: "staff management",
    path: "/owner/staff",
    component: StaffManagement,
  },
  {
    name: "revenue management",
    path: "/owner/revenue",
    component: RevenueManagement,
  },
  {
    name: "appointment management",
    path: "/owner/appointments",
    component: AppointmentManagement,
  },

  // Redirect old route to new route for owner
  {
    name: "owner redirect",
    path: "/phongkham",
    component: OwnerRedirect,
  },

  // {
  //   name: "register",
  //   path: "/register",
  //   component: RegisterPage,
  // },
];

export { publicRoutes, privateRoutes };

// icons
import {
  faBoxesStacked,
  faSliders,
  faTags,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { faRectangleList } from "@fortawesome/free-regular-svg-icons";

// constants
import { ADMINISTRADOR, CLIENTE, TRANSPORTISTA } from "../Utils/constants";

// pages
// private
// koby
import { ResiduosList } from "../pages/private/Residuos";
import { RecoleccionesList } from "../pages/private/Recolecciones";
import { ReportesList } from "../pages/private/ReporteRecoleccion";
import { RutasList, VehiculoList } from "../pages/private/RutasVehiculos";

import { CarruselList } from "../pages/private/Ajustes";
import { UsuarioList } from "../pages/private/Usuarios";

// public
import LoginScreen from "../pages/public/LoginScreen";
import Home from "../pages/public/Home";

export const routes = [
  // private routes
  {
    name: "Residuos",
    icon: faBoxesStacked,
    path: "/residuos",
    component: ResiduosList,
    isPrivate: true,
    showSidebar: true,
    accessValidate: [ADMINISTRADOR, CLIENTE],
  },
  {
    name: "Recolecciones",
    icon: faTags,
    path: "/recolecciones",
    component: RecoleccionesList,
    isPrivate: true,
    showSidebar: true,
    accessValidate: [ADMINISTRADOR, TRANSPORTISTA],
  },
  {
    name: "Rutas",
    icon: faTags,
    path: "/rutas",
    isPrivate: true,
    showSidebar: true,
    accessValidate: [ADMINISTRADOR, TRANSPORTISTA],
    subMenu: [
      {
        name: "Rutas",
        path: "/rutas/rutas",
        component: RutasList,
      },
      {
        name: "Vehículos",
        path: "/rutas/vehiculos",
        component: VehiculoList,
      },
    ],
  },

  {
    name: "Reportes",
    icon: faRectangleList,
    path: "/control_codigos",
    component: ReportesList,
    isPrivate: true,
    showSidebar: true,
    accessValidate: [ADMINISTRADOR, TRANSPORTISTA],
  },
  {
    name: "Ajustes",
    icon: faSliders,
    path: "/ajustes",
    component: CarruselList,
    isPrivate: true,
    showSidebar: true,
    accessValidate: [ADMINISTRADOR],
    subMenu: [
      {
        name: "Imagenes Carrusel",
        path: "/ajustes/carrusel",
        component: CarruselList,
      },
    ],
  },
  {
    name: "Usuarios",
    icon: faUsers,
    path: "/control_usuarios",
    component: UsuarioList,
    isPrivate: true,
    showSidebar: true,
    accessValidate: [ADMINISTRADOR],
  },
  // public routes
  {
    path: "/login",
    component: LoginScreen,
    isPrivate: false,
    showSidebar: false,
    accessValidate: false,
  },
  {
    path: "/",
    component: Home,
    isPrivate: false,
    showSidebar: false,
    accessValidate: false,
  },
];

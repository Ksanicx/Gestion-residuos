import { configureStore } from "@reduxjs/toolkit";

import sidebarReducer from "../features/sidebarSlice";

//
import residuoSlice from "../features/residuoSlice";
import rutaSlice from "../features/rutaSlice";
import vehiculoSlice from "../features/vehiculoSlice";

import recoleccionSlice from "../features/recoleccionSlice";

import carruselSlice from "../features/carruselSlice";

import userReducer from "../features/userSlice";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    residuo: residuoSlice,
    recoleccion: recoleccionSlice,
    ruta: rutaSlice,
    vehiculo: vehiculoSlice,
    carrusel: carruselSlice,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

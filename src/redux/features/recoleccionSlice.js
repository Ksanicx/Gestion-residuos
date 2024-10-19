// redux
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// config
import { db } from "../../firebase/config";

// firebase
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

// toast
import toast from "react-hot-toast";

import { statusText } from "../../Utils/functions";
import ExcelJS from "exceljs";
import moment from "moment";

// -----------------------------------------Funciones-----------------------------------------

// Función para obtener la query global
const getQuery = (recoleccionesCollection, search, sort = "desc") => {
  return query(
    recoleccionesCollection,
    where("active", "==", true),
    orderBy("fecha_recoleccion", sort),
    limit(10)
  );
};

const parceDate = (date, fecha_fin = false) => {
  if (fecha_fin) {
    return date + " " + "23:59:59";
  } else {
    return date + " " + "00:00:00";
  }
};

const getQueryFilter = (
  recoleccionesCollection,
  search,
  filter,
  sort = "desc"
) => {
  const q = search
    ? query(
        recoleccionesCollection,
        where("numero_orden", ">=", search.toLowerCase()),
        where("numero_orden", "<=", search.toLowerCase() + "\uf8ff"),
        filter?.order_state && filter?.order_state?.value !== ""
          ? where("estado", "==", filter?.order_state?.value)
          : where("active", "==", true),
        filter?.id_user !== "" && filter?.id_user?.id !== ""
          ? where("usuario.uid", "==", filter?.id_user?.id)
          : where("active", "==", true),
        orderBy("numero_orden", sort),
        limit(10)
      )
    : query(
        recoleccionesCollection,
        where("active", "==", true),
        filter?.order_state && filter?.order_state?.value !== ""
          ? where("estado", "==", filter.order_state.value)
          : where("active", "==", true),
        filter?.fecha_inicio !== ""
          ? where("fecha_recoleccion", ">=", filter?.fecha_inicio)
          : where("active", "==", true),
        filter?.fecha_fin !== ""
          ? where("fecha_recoleccion", "<=", filter?.fecha_fin)
          : where("active", "==", true),
        orderBy("fecha_recoleccion", sort),
        limit(10)
      );

  return q;
};

// Función para obtener todas las recolecciones de la base de datos
export const getRecolecciones = createAsyncThunk(
  "recoleccion/getRecolecciones",
  async (
    { isNextPage, isPrevPage, search = "", filter = {} },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const recolecciones = [];

      const recoleccionesCollection = collection(db, "residuos");
      const {
        lastVisible,
        firstVisible,
        recolecciones: _recolecciones,
      } = getState().recoleccion;

      let querySnapshot = null;

      if (!isNextPage && !isPrevPage) {
        const q =
          Object.keys(filter).length > 0 && filter
            ? getQueryFilter(recoleccionesCollection, search, filter)
            : getQuery(recoleccionesCollection, search);
        querySnapshot = await getDocs(q);
      }

      if (_recolecciones.length === 0 && isPrevPage) {
        const q =
          Object.keys(filter).length > 0 && filter
            ? getQueryFilter(recoleccionesCollection, search, filter, "desc")
            : getQuery(recoleccionesCollection, search, "desc");
        querySnapshot = await getDocs(q);
        dispatch(resetPage());
      }

      // Obtener el último documento visible
      if ((isNextPage || isPrevPage) && _recolecciones.length !== 0) {
        const order_by = !isNextPage ? "asc" : "desc";
        const next =
          Object.keys(filter).length > 0 && filter
            ? query(
                recoleccionesCollection,
                where("active", "==", true),
                filter?.order_state && filter?.order_state.value
                  ? where("status", "==", filter.order_state.value)
                  : where("active", "==", true),
                filter?.id_user !== "" && filter?.id_user?.id !== ""
                  ? where("usuario.uid", "==", filter.id_user.id)
                  : where("active", "==", true),
                filter?.fecha_inicio
                  ? where("created_at", ">=", parceDate(filter?.fecha_inicio))
                  : where("active", "==", true),
                filter?.fecha_fin
                  ? where(
                      "created_at",
                      "<=",
                      parceDate(filter?.fecha_fin, true)
                    )
                  : where("active", "==", true),
                orderBy("created_at", order_by),
                startAfter(isNextPage ? lastVisible : firstVisible),
                limit(10)
              )
            : query(
                recoleccionesCollection,
                where("active", "==", true),
                orderBy("created_at", order_by),
                startAfter(isNextPage ? lastVisible : firstVisible),
                limit(10)
              );

        querySnapshot = await getDocs(next);
      }

      if (querySnapshot.docs.length > 0) {
        let lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        let firstDoc = querySnapshot.docs[0];

        if (isNextPage || isPrevPage) {
          lastDoc =
            querySnapshot.docs[isNextPage ? querySnapshot.docs.length - 1 : 0];
          firstDoc =
            querySnapshot.docs[isNextPage ? 0 : querySnapshot.docs.length - 1];
        }

        dispatch(setLastVisible(lastDoc));
        dispatch(setFirstVisible(firstDoc));
      }

      if (isPrevPage) querySnapshot = querySnapshot.docs.reverse();

      querySnapshot.forEach((doc) => {
        recolecciones.push({ ...doc.data(), id: doc.id });
      });
      return recolecciones;
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

const ExcelDownloadButton = async (data) => {
  // Crear un nuevo workbook y una nueva hoja
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("My Sheet");

  // Agregar columnas al worksheet
  worksheet.columns = [
    {
      header: "Fecha de recolección solicitada",
      key: "fecha_recoleccion",
      width: 20,
    },
    {
      header: "Fecha de recolección realizada",
      key: "fecha_recoleccion_realizada",
      width: 20,
    },
    { header: "Comentario cliente", key: "comentario_cliente", width: 30 },
    { header: "Ubicación", key: "ubicacion", width: 30 },
    { header: "Ruta Asignada", key: "ruta", width: 30 },
    { header: "Cantidad", key: "cantidad", width: 5 },
    { header: "Estado", key: "estado", width: 20 },
    {
      header: "Comentario reciclador",
      key: "comentario_reciclador",
      width: 30,
    },
    { header: "Monto cobrado", key: "monto_cobrado", width: 10 },
  ];

  // Agregar filas con datos
  data?.map((recoleccion) => {
    worksheet.addRow({
      fecha_recoleccion: recoleccion?.fecha_recoleccion,
      fecha_recoleccion_realizada: recoleccion?.fecha_recoleccion_reciclador,
      comentario_cliente: recoleccion?.comentario,
      ubicacion: recoleccion?.ubicacion,
      ruta: `${recoleccion?.ruta?.nombre_ruta || ""} - ${
        recoleccion?.ruta?.vehiculo_id?.placa || ""
      }`,
      cantidad: recoleccion?.residuos?.length || 0,
      estado: statusText[recoleccion?.estado],
      comentario_reciclador: recoleccion?.comentario_reciclador,
      monto_cobrado: recoleccion?.monto_cobrado,
    });
  });

  worksheet.getRow(1).font = { bold: true };

  // Generar el archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();

  // Crear un enlace temporal para descargar el archivo
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  // Crear un enlace de descarga y hacer clic en él automáticamente
  const link = document.createElement("a");
  link.href = url;
  link.download = `${moment
    .utc()
    .format("YYYY-MM-DD_HH:mm:ss")}_reporte_recolecciones.xlsx`;
  link.click();

  // Limpiar el objeto URL después de descargar
  URL.revokeObjectURL(url);
};
// Funcion para obtener todos las recolecciones de la base de datos
export const generateExcel = createAsyncThunk(
  "recoleccion/generateExcel",
  async (
    { isNextPage, isPrevPage, search = "", filter = {} },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const recolecciones = [];

      const recoleccionesCollection = collection(db, "residuos");

      let querySnapshot = null;

      querySnapshot = await getDocs(
        query(
          recoleccionesCollection,
          where("active", "==", true),
          orderBy("fecha_recoleccion", "desc")
        )
      );

      querySnapshot.forEach((doc) => {
        recolecciones.push({ ...doc.data(), id: doc.id });
      });

      await ExcelDownloadButton(recolecciones);
      return recolecciones;
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

export const getRecoleccion = createAsyncThunk(
  "recoleccion/getRecoleccion",
  async (recoleccion_id, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "residuos", recoleccion_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          id: docSnap.id,
        };
      } else {
        toast.error("No se encontró el residuo");
        return rejectWithValue("No se encontró el residuo");
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Cambiar el estado de la recolección
export const changeRecoleccionState = createAsyncThunk(
  "recoleccion/changeRecoleccionState",
  async (
    {
      id,
      status,
      monto_cobrado = 0,
      comentario_reciclador = "",
      fecha_recoleccion_reciclador = "",
      ruta = "",
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const docRef = doc(db, "residuos", id);

      const update = updateDoc(docRef, {
        estado: status,
        comentario_reciclador,
        monto_cobrado,
        fecha_recoleccion_reciclador,
        ruta,
      });

      await toast.promise(update, {
        loading: "Actualizando...",
        success: "Estado de la recolección actualizado",
        error: "Error al editar la recolección",
      });

      // Reiniciar la paginación y actualizar la lista de recolecciones
      dispatch(resetPage());
      dispatch(getRecolecciones({ isNextPage: false, isPrevPage: false }));

      return docRef;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err);
    }
  }
);
// -----------------------------------------Slice-----------------------------------------
export const recoleccionSlice = createSlice({
  name: "recoleccion",
  initialState: {
    recolecciones: [],
    recoleccion_selected: null,
    error: null,
    loading_recoleccion: false,
    loading_excel: false,
    loading_actions: false,
    firstVisible: null,
    lastVisible: null,
    page: 1,
  },
  reducers: {
    nextPage: (state) => {
      state.page += 1;
    },
    prevPage: (state) => {
      state.page -= 1;
    },

    resetPage: (state) => {
      state.page = 1;
    },

    setFirstVisible: (state, action) => {
      state.firstVisible = action.payload;
    },
    setLastVisible: (state, action) => {
      state.lastVisible = action.payload;
    },
  },

  extraReducers: {
    [getRecolecciones.pending]: (state) => {
      state.loading_recoleccion = true;
    },
    [getRecolecciones.fulfilled]: (state, action) => {
      state.loading_recoleccion = false;
      state.recolecciones = action.payload;
    },
    [getRecolecciones.rejected]: (state, action) => {
      state.loading_recoleccion = false;
      state.error = action.payload;
    },

    [generateExcel.pending]: (state) => {
      state.loading_excel = true;
    },
    [generateExcel.fulfilled]: (state, action) => {
      state.loading_excel = false;
    },
    [generateExcel.rejected]: (state, action) => {
      state.loading_excel = false;
      state.error = action.payload;
    },

    [changeRecoleccionState.pending]: (state) => {
      state.loading_actions = true;
    },
    [changeRecoleccionState.fulfilled]: (state) => {
      state.loading_actions = false;
    },
    [changeRecoleccionState.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload.message;
    },

    [getRecoleccion.pending]: (state) => {
      state.loading_actions = true;
    },
    [getRecoleccion.fulfilled]: (state, action) => {
      state.loading_actions = false;
      state.recoleccion_selected = action.payload;
    },
    [getRecoleccion.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload.message;
    },
  },
});

export const {
  nextPage,
  prevPage,
  resetPage,
  setFirstVisible,
  setLastVisible,
} = recoleccionSlice.actions;

// -----------------------------------------Selector-----------------------------------------
export const selectRecolecciones = (state) => state.recoleccion.recolecciones;
export const selectLoadingRecolecciones = (state) =>
  state.recoleccion.loading_recoleccion;
export const selectLoadingExcel = (state) => state.recoleccion.loading_excel;
export const selectPage = (state) => state.recoleccion.page;
export const selectRecoleccionSelected = (state) =>
  state.recoleccion.recoleccion_selected;
export const selectLoadingActions = (state) =>
  state.recoleccion.loading_actions;

export default recoleccionSlice.reducer;

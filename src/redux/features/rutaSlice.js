// redux
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// config
import { db } from "../../firebase/config";

// constants
import { document_info } from "../../Utils/constants";

// firebase
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

// toast
import toast from "react-hot-toast";

// -----------------------------------------Funciones-----------------------------------------

// Funcion para obtener la query global
const getQuery = (rutasCollection, search, sort = "asc") => {
  return query(rutasCollection, where("active", "==", true), limit(10));
};

// Funcion para obtener todas las rutas de la base de datos
export const getRutas = createAsyncThunk(
  "ruta/getRutas",
  async (
    { isNextPage, isPrevPage, search = "" },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const rutas = [];

      const rutasCollection = collection(db, "rutas");
      const { lastVisible, firstVisible, rutas: _rutas } = getState().ruta;

      let querySnapshot = null;

      if (!isNextPage && !isPrevPage) {
        const q = getQuery(rutasCollection, search);
        querySnapshot = await getDocs(q);
      }

      if (_rutas.length === 0 && isPrevPage) {
        const q = getQuery(rutasCollection, search, "desc");
        querySnapshot = await getDocs(q);
        dispatch(resetPage());
      }

      // Get the last visible document
      if ((isNextPage || isPrevPage) && _rutas.length !== 0) {
        const order_by = !isNextPage ? "desc" : "asc";
        // Construct a new query starting at this document,
        // get the next or prev 10 rutas.
        const next = query(
          rutasCollection,
          where("active", "==", true),
          orderBy("nombre_ruta", order_by),
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
        rutas.push({ ...doc.data(), id: doc.id });
      });
      return rutas;
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

// Funcion para eliminar una ruta
export const eliminarRuta = createAsyncThunk(
  "ruta/eliminarRuta",
  async (ruta_id, { dispatch, rejectWithValue }) => {
    try {
      const docRef = doc(db, "rutas", ruta_id);

      const updateTimestamp = updateDoc(docRef, {
        active: false,
        updated_at: new Date(),
      });

      await toast.promise(updateTimestamp, {
        loading: "Eliminando...",
        success: "Ruta eliminada",
        error: "Error al eliminar la ruta",
      });

      dispatch(resetPage());
      dispatch(getRutas({ isNextPage: false, isPrevPage: false }));

      return docRef;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Funcion para obtener una ruta por id
export const getRuta = createAsyncThunk(
  "ruta/getRuta",
  async (ruta_id, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "rutas", ruta_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          id: docSnap.id,
        };
      } else {
        toast.error("No se encontró la ruta");
        return rejectWithValue("No se encontró la ruta");
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Funcion para crear una ruta
export const createRuta = createAsyncThunk(
  "ruta/createRuta",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const { onClose, reset, ...data } = params;

      const new_ruta = addDoc(collection(db, "rutas"), {
        ...document_info,
        ...data,
      });

      await toast.promise(new_ruta, {
        loading: "Creando...",
        success: "Ruta creada",
        error: "Error al crear la Ruta",
      });

      dispatch(resetPage());
      dispatch(getRutas({ isNextPage: false, isPrevPage: false }));

      onClose();
      reset();

      return new_ruta;
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

// Funcion para actualizar una ruta
export const updateRuta = createAsyncThunk(
  "ruta/updateRuta",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const { id, onClose, reset, ...data } = params;

      const docRef = doc(db, "rutas", id);

      // transaction atomic
      const transactionFunc = () =>
        runTransaction(db, async (transaction) => {
          const doc = await transaction.get(docRef);

          if (!doc.exists()) {
            toast.error("La ruta no existe");
            throw "La ruta no existe";
          }

          transaction.update(docRef, {
            ...data,
            updated_at: new Date(),
          });

          // update ruta en productos
          const productos = await getDocs(
            query(
              collection(db, "residuos"),
              where("ruta.id", "==", id),
              where("active", "==", true)
            )
          );

          productos.forEach((doc) => {
            // Obtener el ID del documento
            const docRef = doc.ref;

            // Actualizar el documento con los nuevos datos
            transaction.update(docRef, {
              ruta: { ...data, id },
            });
          });
        });

      await toast.promise(transactionFunc(), {
        loading: "Actualizando...",
        success: "Ruta actualizada",
        error: "Error al actualizar la Ruta",
      });

      onClose();
      reset();

      dispatch(resetPage());
      dispatch(getRutas({ isNextPage: false, isPrevPage: false }));

      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// -----------------------------------------Slice-----------------------------------------
export const rutaSlice = createSlice({
  name: "ruta",
  initialState: {
    rutas: [],
    ruta_selected: null,
    ruta_data_update: null,
    error: null,
    loading_ruta: false,
    loading_actions: false,
    isUpdate: false,
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

    // Actions Ruta
    setRutaSelected: (state, action) => {
      state.ruta_selected = action.payload;
    },

    // Update state isUpdate
    setIsUpdate: (state, action) => {
      state.isUpdate = action.payload;
    },
  },

  extraReducers: {
    // Get rutas
    [getRutas.pending]: (state) => {
      state.loading_ruta = true;
    },
    [getRutas.fulfilled]: (state, action) => {
      state.loading_ruta = false;
      state.rutas = action.payload;
    },
    [getRutas.rejected]: (state, action) => {
      state.loading_ruta = false;
      state.error = action.payload;
    },

    // Eliminar ruta
    [eliminarRuta.pending]: (state) => {
      state.loading_ruta = true;
    },
    [eliminarRuta.fulfilled]: (state) => {
      state.loading_ruta = false;
    },
    [eliminarRuta.rejected]: (state, action) => {
      state.loading_ruta = false;
      state.error = action.payload.message;
    },

    // Get ruta
    [getRuta.pending]: (state) => {
      state.loading_actions = true;
    },
    [getRuta.fulfilled]: (state, action) => {
      state.ruta_data_update = action.payload;
      state.loading_actions = false;
    },
    [getRuta.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload.message;
    },

    // Crear ruta
    [createRuta.pending]: (state) => {
      state.loading_actions = true;
    },
    [createRuta.fulfilled]: (state) => {
      state.loading_actions = false;
    },
    [createRuta.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload.message;
    },

    // Actualizar ruta
    [updateRuta.pending]: (state) => {
      state.loading_actions = true;
    },
    [updateRuta.fulfilled]: (state) => {
      state.loading_actions = false;
    },
    [updateRuta.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload.message;
    },
  },
});

export const {
  setRutaSelected,
  setIsUpdate,
  resetPage,
  nextPage,
  prevPage,
  setFirstVisible,
  setLastVisible,
} = rutaSlice.actions;

export const selectRutas = (state) => state.ruta.rutas;
export const selectRutaSelected = (state) => state.ruta.ruta_selected;
export const selectRutaDataUpdate = (state) => state.ruta.ruta_data_update;
export const selectLoadingRutas = (state) => state.ruta.loading_ruta;
export const selectLoadingActions = (state) => state.ruta.loading_actions;
export const selectIsUpdate = (state) => state.ruta.isUpdate;
export const selectFirstVisible = (state) => state.ruta.firstVisible;
export const selectLastVisible = (state) => state.ruta.lastVisible;
export const selectPage = (state) => state.ruta.page;

export default rutaSlice.reducer;

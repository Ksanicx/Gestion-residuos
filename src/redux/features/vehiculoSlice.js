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
const getQuery = (vehiculosCollection, search, sort = "asc") => {
  return query(
    vehiculosCollection,
    // where("active", "==", true),
    orderBy("placa", sort),
    limit(10)
  );
};

// Funcion para obtener todos los vehículos de la base de datos
export const getVehiculos = createAsyncThunk(
  "vehiculo/getVehiculos",
  async (
    { isNextPage, isPrevPage, search = "" },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const vehiculos = [];

      const vehiculosCollection = collection(db, "vehiculos");
      const {
        lastVisible,
        firstVisible,
        vehiculos: _vehiculos,
      } = getState().vehiculo;

      let querySnapshot = null;

      if (!isNextPage && !isPrevPage) {
        const q = getQuery(vehiculosCollection, search);
        querySnapshot = await getDocs(q);
      }

      if (_vehiculos.length === 0 && isPrevPage) {
        const q = getQuery(vehiculosCollection, search, "desc");
        querySnapshot = await getDocs(q);
        dispatch(resetPage());
      }

      // Get the last visible document
      if ((isNextPage || isPrevPage) && _vehiculos.length !== 0) {
        const order_by = !isNextPage ? "desc" : "asc";
        // Construct a new query starting at this document,
        // get the next or prev 10 vehículos.
        const next = query(
          vehiculosCollection,
          where("active", "==", true),
          orderBy("nombre_vehiculo", order_by),
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
        vehiculos.push({ ...doc.data(), id: doc.id });
      });
      return vehiculos;
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

// funcion para eliminar un vehículo
export const eliminarVehiculo = createAsyncThunk(
  "vehiculo/eliminarVehiculo",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const docRef = doc(db, "vehiculos", params?.id);

      const updateTimestamp = updateDoc(docRef, {
        active: !params.stauts,
        updated_at: new Date(),
      });

      await toast.promise(updateTimestamp, {
        loading: "Eliminando...",
        success: "Estado del vehículo actualizado",
        error: "Error al actualizar el estado del vehículo",
      });

      dispatch(resetPage());
      dispatch(getVehiculos({ isNextPage: false, isPrevPage: false }));

      return docRef;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// funcion para obtener un vehículo por id
export const getVehiculo = createAsyncThunk(
  "vehiculo/getVehiculo",
  async (vehiculo_id, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "vehiculos", vehiculo_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          id: docSnap.id,
        };
      } else {
        toast.error("No se encontró el vehículo");
        return rejectWithValue("No se encontró el vehículo");
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// funcion para crear un vehículo
export const createVehiculo = createAsyncThunk(
  "vehiculo/createVehiculo",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const { onClose, reset, ...data } = params;

      const new_vehiculo = addDoc(collection(db, "vehiculos"), {
        ...document_info,
        ...data,
      });

      await toast.promise(new_vehiculo, {
        loading: "Creando...",
        success: "Vehículo creado",
        error: "Error al crear el vehículo",
      });

      dispatch(resetPage());
      dispatch(getVehiculos({ isNextPage: false, isPrevPage: false }));

      onClose();
      reset();

      return new_vehiculo;
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

// funcion para actualizar un vehículo
export const updateVehiculo = createAsyncThunk(
  "vehiculo/updateVehiculo",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const { id, onClose, reset, ...data } = params;

      const docRef = doc(db, "vehiculos", id);

      // transaction atomic
      const transactionFunc = () =>
        runTransaction(db, async (transaction) => {
          const doc = await transaction.get(docRef);

          if (!doc.exists()) {
            toast.error("El vehículo no existe");
            throw "El vehículo no existe";
          }

          transaction.update(docRef, {
            ...data,
            updated_at: new Date(),
          });
        });

      await toast.promise(transactionFunc(), {
        loading: "Actualizando...",
        success: "Vehículo actualizado",
        error: "Error al actualizar el vehículo",
      });

      onClose();
      reset();

      dispatch(resetPage());
      dispatch(getVehiculos({ isNextPage: false, isPrevPage: false }));

      return id;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err);
    }
  }
);

// -----------------------------------------Slice-----------------------------------------
export const vehiculoSlice = createSlice({
  name: "vehiculo",
  initialState: {
    vehiculos: [],
    vehiculo_selected: null,
    vehiculo_data_update: null,
    error: null,
    loading_vehiculo: false,
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

    // actions Vehiculo
    setVehiculoSelected: (state, action) => {
      state.vehiculo_selected = action.payload;
    },

    // update state isUpdate
    setIsUpdate: (state, action) => {
      state.isUpdate = action.payload;
    },
  },

  extraReducers: {
    // get vehiculos
    [getVehiculos.pending]: (state) => {
      state.loading_vehiculo = true;
    },
    [getVehiculos.fulfilled]: (state, action) => {
      state.loading_vehiculo = false;
      state.vehiculos = action.payload;
    },
    [getVehiculos.rejected]: (state, action) => {
      state.loading_vehiculo = false;
      state.error = action.payload;
    },

    // eliminar vehiculo
    [eliminarVehiculo.pending]: (state, action) => {
      state.loading_vehiculo = true;
    },
    [eliminarVehiculo.fulfilled]: (state, action) => {
      state.loading_vehiculo = false;
    },
    [eliminarVehiculo.rejected]: (state, action) => {
      state.loading_vehiculo = false;
      state.error = action.payload.message;
    },

    // get vehiculo
    [getVehiculo.pending]: (state, action) => {
      state.loading_actions = true;
    },
    [getVehiculo.fulfilled]: (state, action) => {
      state.vehiculo_data_update = action.payload;
      state.loading_actions = false;
    },
    [getVehiculo.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload.message;
    },

    // create vehiculo
    [createVehiculo.pending]: (state, action) => {
      state.loading_actions = true;
    },
    [createVehiculo.fulfilled]: (state, action) => {
      state.loading_actions = false;
    },
    [createVehiculo.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload.message;
    },

    // update vehiculo
    [updateVehiculo.pending]: (state, action) => {
      state.loading_actions = true;
    },
    [updateVehiculo.fulfilled]: (state, action) => {
      state.loading_actions = false;
    },
    [updateVehiculo.rejected]: (state, action) => {
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
  setVehiculoSelected,
  setIsUpdate,
} = vehiculoSlice.actions;

// -----------------------------------------Selector-----------------------------------------
export const selectVehiculos = (state) => state.vehiculo.vehiculos;
export const selectLoadingVehiculos = (state) =>
  state.vehiculo.loading_vehiculo;
export const selectPage = (state) => state.vehiculo.page;
export const selectVehiculoSelected = (state) =>
  state.vehiculo.vehiculo_selected;
export const loadingActions = (state) => state.vehiculo.loading_actions;
export const selectVehiculoDataUpdate = (state) =>
  state.vehiculo.vehiculo_data_update;
export const selectIsUpdate = (state) => state.vehiculo.isUpdate;

export default vehiculoSlice.reducer;

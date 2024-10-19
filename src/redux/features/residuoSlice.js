// redux
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// config
import { db } from "../../firebase/config";

// constants
import { ADMINISTRADOR } from "../../Utils/constants";

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
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

// toast
import toast from "react-hot-toast";

// uuid
import { v4 as uuidv4 } from "uuid";

// -----------------------------------------Funciones-----------------------------------------

// Función para obtener la query global
const getQuery = (residuosCollection, search, sort = "desc", uid) => {
  let querValidate;
  if (uid) {
    querValidate = query(
      residuosCollection,
      where("active", "==", true),
      where("user", "==", uid),
      orderBy("fecha_recoleccion", sort),
      limit(10)
    );
  } else {
    querValidate = query(
      residuosCollection,
      where("active", "==", true),
      orderBy("fecha_recoleccion", sort),
      limit(10)
    );
  }

  return querValidate;
};

// Función para obtener todos los residuos de la base de datos
export const getResiduos = createAsyncThunk(
  "residuo/getResiduos",
  async (
    { isNextPage, isPrevPage, search = "" },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const residuos = [];

      const residuosCollection = collection(db, "residuos");
      const {
        lastVisible,
        firstVisible,
        residuos: _residuos,
      } = getState().residuo;

      let querySnapshot = null;

      const { user } = getState().user;

      let uid = user?.uid;

      if (user.role === ADMINISTRADOR) {
        uid = "";
      }

      if (!isNextPage && !isPrevPage) {
        const q = getQuery(residuosCollection, search, "asc", uid);
        querySnapshot = await getDocs(q);
      }

      if (_residuos.length === 0 && isPrevPage) {
        const q = getQuery(residuosCollection, search, "desc", uid);
        querySnapshot = await getDocs(q);
        dispatch(resetPage());
      }

      if ((isNextPage || isPrevPage) && _residuos.length !== 0) {
        const order_by = !isNextPage ? "desc" : "asc";
        const next = query(
          residuosCollection,
          where("active", "==", true),
          orderBy("fecha_recoleccion", order_by),
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
        residuos.push({ ...doc.data(), id: doc.id });
      });
      return residuos;
    } catch (err) {
      console.log(err.message);
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

// Función para eliminar un residuo
export const eliminarResiduo = createAsyncThunk(
  "residuo/eliminarResiduo",
  async (residuo_id, { dispatch, rejectWithValue }) => {
    try {
      const docRef = doc(db, "residuos", residuo_id);

      const updateTimestamp = updateDoc(docRef, {
        active: false,
        updated_at: new Date(),
      });

      await toast.promise(updateTimestamp, {
        loading: "Eliminando...",
        success: "Residuo eliminado",
        error: "Error al eliminar el residuo",
      });

      dispatch(resetPage());
      dispatch(getResiduos({ isNextPage: false, isPrevPage: false }));

      return docRef;
    } catch (err) {
      console.log(err.message);
      return rejectWithValue(err);
    }
  }
);

// Función para obtener un residuo por id
export const getResiduo = createAsyncThunk(
  "residuo/getResiduo",
  async (residuo_id, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "residuos", residuo_id);
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

// Función para crear un residuo
export const createResiduo = createAsyncThunk(
  "residuo/createResiduo",
  async (params, { dispatch, rejectWithValue, getState }) => {
    try {
      const { onClose, reset, ...data } = params;

      const residuosWithUid = data.residuos.map((precio) => {
        return { ...precio, id: uuidv4() };
      });

      const { user } = getState().user;

      const new_residuo = addDoc(collection(db, "residuos"), {
        ...data,
        residuos: residuosWithUid,
        active: true,
        estado: 0,
        created_at: new Date(),
        user: user?.uid,
      });

      await toast.promise(new_residuo, {
        loading: "Creando...",
        success: "Residuo creado",
        error: "Error al crear el residuo",
      });

      dispatch(resetPage());
      dispatch(getResiduos({ isNextPage: false, isPrevPage: false }));

      onClose();
      reset();

      return new_residuo;
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err);
    }
  }
);

// Función para actualizar un residuo
export const updateResiduo = createAsyncThunk(
  "residuo/updateResiduo",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const { id, onClose, reset, ...data } = params;

      const residuosWithUid = data.residuos.map((precio) => {
        return { ...precio, id: precio.id || uuidv4() };
      });

      const residuo = updateDoc(doc(db, "residuos", id), {
        ...data,
        residuos: residuosWithUid,
        updated_at: new Date(),
      });

      await toast.promise(residuo, {
        loading: "Actualizando...",
        success: "Residuo actualizado",
        error: "Error al actualizar el residuo",
      });

      onClose();
      reset();

      dispatch(resetPage());
      dispatch(getResiduos({ isNextPage: false, isPrevPage: false }));

      return residuo;
    } catch (err) {
      console.log(err.message);
      return rejectWithValue(err);
    }
  }
);

// -----------------------------------------Slice-----------------------------------------
export const residuoSlice = createSlice({
  name: "residuo",
  initialState: {
    residuos: [],
    residuo_selected: null,
    residuo_data_update: null,
    error: null,
    loading_residuo: false,
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

    // acciones Residuo
    setResiduoSelected: (state, action) => {
      state.residuo_selected = action.payload;
    },

    setIsUpdate: (state, action) => {
      state.isUpdate = action.payload;
    },
  },

  extraReducers: {
    [getResiduos.pending]: (state) => {
      state.loading_residuo = true;
    },
    [getResiduos.fulfilled]: (state, action) => {
      state.loading_residuo = false;
      state.residuos = action.payload;
    },
    [getResiduos.rejected]: (state, action) => {
      state.loading_residuo = false;
      state.error = action.payload;
    },

    [getResiduo.pending]: (state) => {
      state.loading_actions = true;
    },
    [getResiduo.fulfilled]: (state, action) => {
      state.loading_actions = false;
      state.residuo_selected = action.payload;
    },
    [getResiduo.rejected]: (state, action) => {
      state.loading_actions = false;
      state.error = action.payload;
    },
  },
});

export const {
  setResiduoSelected,
  setIsUpdate,
  nextPage,
  prevPage,
  resetPage,
  setFirstVisible,
  setLastVisible,
} = residuoSlice.actions;

// -----------------------------------------Selector-----------------------------------------
export const selectResiduos = (state) => state.residuo.residuos;
export const selectLoadingResiduos = (state) => state.residuo.loading_residuo;
export const selectPage = (state) => state.residuo.page;
export const selectResiduoSelected = (state) => state.residuo.residuo_selected;
export const loadingActions = (state) => state.residuo.loading_actions;
export const selectResiduoDataUpdate = (state) =>
  state.residuo.residuo_data_update;
export const selectIsUpdate = (state) => state.residuo.isUpdate;

export default residuoSlice.reducer;

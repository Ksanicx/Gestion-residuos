import React, { useEffect } from "react";

// components
import HeaderViewContent from "../../../../../components/HeaderViewContent";
import Table from "../../../../../components/Table";
import EliminarRuta from "../Eliminar/EliminarRuta";
import CrearActualizar from "../CrearActualizar";

// hooks
import useColumns from "../../../../../hooks/useColumns";

// utils
import { columns } from "./columns";

// redux
import {
  getRutas,
  nextPage,
  prevPage,
  selectLoadingRutas,
  selectPage,
  selectRutas,
  setIsUpdate,
} from "../../../../../redux/features/rutaSlice";
import { useDispatch, useSelector } from "react-redux";

// chakra
import { useDisclosure } from "@chakra-ui/react";

const RutasList = () => {
  const dispatch = useDispatch();

  // modal eliminar
  const {
    isOpen: isOpenEliminar,
    onOpen: onOpenEliminar,
    onClose: onCloseEliminar,
  } = useDisclosure();

  // modal create update
  const {
    isOpen: isOpenCreateUpdate,
    onOpen: onOpenCreateUpdate,
    onClose: onCloseCreateUpdate,
  } = useDisclosure();

  // columnas de la tabla
  const columnsRender = useColumns(columns(onOpenEliminar, onOpenCreateUpdate));

  // selectores de redux
  const loading = useSelector(selectLoadingRutas);
  const rutasData = useSelector(selectRutas);
  const page = useSelector(selectPage);

  const nextPageTable = () => {
    dispatch(nextPage());
    dispatch(getRutas({ isNextPage: true, isPrevPage: false }));
  };

  const prevPageTable = () => {
    dispatch(prevPage());
    dispatch(getRutas({ isNextPage: false, isPrevPage: true }));
  };

  const onOpenCreate = () => {
    dispatch(setIsUpdate(false));
    onOpenCreateUpdate();
  };

  useEffect(() => {
    dispatch(getRutas({ isNextPage: false, isPrevPage: false }));
  }, [dispatch]);

  return (
    <>
      {/* modal create update */}
      <CrearActualizar
        isOpen={isOpenCreateUpdate}
        onClose={onCloseCreateUpdate}
      />

      {/* modal eliminar */}
      <EliminarRuta isOpen={isOpenEliminar} onClose={onCloseEliminar} />

      <HeaderViewContent
        titleView="Rutas"
        textButton="Nueva ruta"
        showFilterButton={false}
        onOpen={onOpenCreate}
        showSearchButton={false}
      />

      <Table
        columns={columnsRender}
        data={rutasData}
        loading={loading}
        page={page}
        prevPageTable={prevPageTable}
        nextPageTable={nextPageTable}
        isSubModuleLoading
      />
    </>
  );
};

export default RutasList;

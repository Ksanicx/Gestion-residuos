import React, { useEffect } from "react";

// components
import HeaderViewContent from "../../../../components/HeaderViewContent";
import Table from "../../../../components/Table";
import EliminarResiduo from "../Eliminar/EliminarResiduo";
import CrearActualizar from "../CrearActualizar";

// hooks
import useColumns from "../../../../hooks/useColumns";

// utils
import { columns } from "./columns";

// redux
import {
  getResiduos,
  nextPage,
  prevPage,
  selectLoadingResiduos,
  selectPage,
  selectResiduos,
  setIsUpdate,
} from "../../../../redux/features/residuoSlice";
import { useDispatch, useSelector } from "react-redux";

// chakra
import { useDisclosure } from "@chakra-ui/react";

const ResiduosList = () => {
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
  const loading = useSelector(selectLoadingResiduos);
  const residuos = useSelector(selectResiduos);
  const page = useSelector(selectPage);

  const nextPageTable = () => {
    dispatch(nextPage());
    dispatch(getResiduos({ isNextPage: true, isPrevPage: false }));
  };

  const prevPageTable = () => {
    dispatch(prevPage());
    dispatch(getResiduos({ isNextPage: false, isPrevPage: true }));
  };

  const onOpenCreate = () => {
    dispatch(setIsUpdate(false));
    onOpenCreateUpdate();
  };

  useEffect(() => {
    dispatch(getResiduos({ isNextPage: false, isPrevPage: false }));
  }, [dispatch]);

  return (
    <>
      <CrearActualizar
        isOpen={isOpenCreateUpdate}
        onClose={onCloseCreateUpdate}
      />

      {/* modal eliminar */}
      <EliminarResiduo isOpen={isOpenEliminar} onClose={onCloseEliminar} />

      <HeaderViewContent
        titleView="Residuos"
        textButton="Nuevo residuo"
        showSearchButton={false}
        showFilterButton={false}
        onOpen={onOpenCreate}
      />

      <Table
        columns={columnsRender}
        data={residuos}
        loading={loading}
        page={page}
        prevPageTable={prevPageTable}
        nextPageTable={nextPageTable}
        isSubModuleLoading
      />
    </>
  );
};

export default ResiduosList;

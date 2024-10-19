import React, { useEffect } from "react";

// components
import HeaderViewContent from "../../../../../components/HeaderViewContent";
import Table from "../../../../../components/Table";
import EliminarVehiculo from "../Eliminar/EliminarVehiculo";
import CrearActualizar from "../CrearActualizar";

// hooks
import useColumns from "../../../../../hooks/useColumns";

// utils
import { columns } from "./columns";

// redux
import {
  getVehiculos,
  nextPage,
  prevPage,
  selectLoadingVehiculos,
  selectPage,
  selectVehiculos,
  setIsUpdate,
} from "../../../../../redux/features/vehiculoSlice";
import { useDispatch, useSelector } from "react-redux";

// chakra
import { useDisclosure } from "@chakra-ui/react";

const VehiculoList = () => {
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
  const loading = useSelector(selectLoadingVehiculos);
  const vehiculosData = useSelector(selectVehiculos);
  const page = useSelector(selectPage);

  const nextPageTable = () => {
    dispatch(nextPage());
    dispatch(getVehiculos({ isNextPage: true, isPrevPage: false }));
  };

  const prevPageTable = () => {
    dispatch(prevPage());
    dispatch(getVehiculos({ isNextPage: false, isPrevPage: true }));
  };

  const onOpenCreate = () => {
    dispatch(setIsUpdate(false));
    onOpenCreateUpdate();
  };

  useEffect(() => {
    dispatch(getVehiculos({ isNextPage: false, isPrevPage: false }));
  }, [dispatch]);

  return (
    <>
      {/* modal create update */}
      <CrearActualizar
        isOpen={isOpenCreateUpdate}
        onClose={onCloseCreateUpdate}
      />

      {/* modal eliminar */}
      <EliminarVehiculo isOpen={isOpenEliminar} onClose={onCloseEliminar} />

      <HeaderViewContent
        titleView="Vehículos"
        textButton="Nueva vehículo"
        showFilterButton={false}
        onOpen={onOpenCreate}
        showSearchButton={false}
      />
      <Table
        columns={columnsRender}
        data={vehiculosData}
        loading={loading}
        page={page}
        prevPageTable={prevPageTable}
        nextPageTable={nextPageTable}
        isSubModuleLoading
      />
    </>
  );
};

export default VehiculoList;

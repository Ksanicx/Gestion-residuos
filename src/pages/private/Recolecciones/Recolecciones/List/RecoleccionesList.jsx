import React, { useEffect, useState } from "react";

// components
import HeaderViewContent from "../../../../../components/HeaderViewContent";
import Table from "../../../../../components/Table";

// hooks
import useColumns from "../../../../../hooks/useColumns";

// utils
import { columns } from "./columns";

// redux
import {
  changeRecoleccionState,
  getRecolecciones,
  nextPage,
  prevPage,
  selectLoadingRecolecciones,
  selectPage,
  selectRecolecciones,
} from "../../../../../redux/features/recoleccionSlice";
import { useDispatch, useSelector } from "react-redux";
import ModalFilter from "./ModalFilter/ModalFilter";
import { useDisclosure } from "@chakra-ui/react";
import ModalAlert from "../../../../../components/Modal/ModalAlert";
import {
  CANCELADO_RESIDUO,
  FINALIZADO_RESIDUO,
  NO_RECOLECTADO_RESIDUO,
} from "../../../../../Utils/constants";
import { useForm } from "react-hook-form";
import RecoleccionControl from "./RecoleccionControl/RecoleccionControl";

const RecoleccionesList = () => {
  const dispatch = useDispatch();

  const [ventaID, setVentaID] = useState(null);

  // estados
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  // modal filter
  const { isOpen, onOpen, onClose } = useDisclosure();
  // modal alert
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  // modal view
  const {
    isOpen: isOpen3,
    onOpen: onOpen3,
    onClose: onClose3,
  } = useDisclosure();

  // modal view
  const {
    isOpen: isOpen4,
    onOpen: onOpen4,
    onClose: onClose4,
  } = useDisclosure();

  // modal view
  const {
    isOpen: isOpen5,
    onOpen: onOpen5,
    onClose: onClose5,
  } = useDisclosure();

  const [isView, setIsView] = useState(false);

  // columnas de la tabla
  const columnsRender = useColumns(
    columns(onOpen2, onOpen3, onOpen4, onOpen5, setIsView, setVentaID)
  );

  // selectores de redux
  const loading = useSelector(selectLoadingRecolecciones);
  const recoleccionesData = useSelector(selectRecolecciones);
  const page = useSelector(selectPage);

  const nextPageTable = () => {
    dispatch(nextPage());
    dispatch(
      getRecolecciones({ isNextPage: true, isPrevPage: false, search, filter })
    );
  };

  const onSubmit = () => {
    const new_state = {
      id: ventaID,
      status: CANCELADO_RESIDUO,
    };
    dispatch(changeRecoleccionState(new_state));
    onClose2();
  };

  const onSubmitError = (data) => {
    const new_state = {
      id: ventaID,
      status: NO_RECOLECTADO_RESIDUO,
    };

    dispatch(changeRecoleccionState(new_state));
    onClose4();
  };

  const onSubmitReembolso = () => {
    const new_state = {
      id: ventaID,
      status: FINALIZADO_RESIDUO,
    };

    dispatch(changeRecoleccionState(new_state));
    onClose5();
  };

  const prevPageTable = () => {
    dispatch(prevPage());
    dispatch(
      getRecolecciones({ isNextPage: false, isPrevPage: true, search, filter })
    );
  };

  useEffect(() => {
    dispatch(getRecolecciones({ isNextPage: false, isPrevPage: false }));
  }, [dispatch]);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <>
      <ModalFilter
        isOpen={isOpen}
        onClose={onClose}
        search={search}
        setFilter={setFilter}
      />

      <ModalAlert
        subTitleText={"Estas por cancelar la recolección"}
        description={"Al cancelar la recolección, ya no podras modificarlo, "}
        emphasisDescription="esta accion no se podrá revertir."
        isOpen={isOpen2}
        onClose={onClose2}
        onContinue={() => {}}
        onSubmit={handleSubmit(onSubmit)}
      />

      <ModalAlert
        subTitleText={"Estas por marcar como no recolectado"}
        description={"Al marcar este estado, ya no podras modificarlo, "}
        emphasisDescription="esta accion no se podrá revertir."
        isOpen={isOpen4}
        onClose={onClose4}
        onContinue={() => {}}
        onSubmit={handleSubmit(onSubmitError)}
      />

      <ModalAlert
        subTitleText={"Estas por finalizar la recolección"}
        description={"Al finalizar la recolección, ya no podras modificarlo, "}
        emphasisDescription="esta accion no se podrá revertir."
        isOpen={isOpen5}
        onClose={onClose5}
        onContinue={() => {}}
        onSubmit={handleSubmit(onSubmitReembolso)}
      />

      <RecoleccionControl isOpen={isOpen3} onClose={onClose3} isView={isView} />

      <HeaderViewContent
        titleView="Recolecciones"
        showCreateButton={false}
        showSearchButton={false}
        onOpenFilers={onOpen}
      />

      <Table
        columns={columnsRender}
        data={recoleccionesData}
        loading={loading}
        page={page}
        prevPageTable={prevPageTable}
        nextPageTable={nextPageTable}
        isSubModuleLoading
      />
    </>
  );
};

export default RecoleccionesList;

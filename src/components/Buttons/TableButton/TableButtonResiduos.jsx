import React from "react";
import TableButton from "./TableButton";

// redux
import { useDispatch } from "react-redux";
import {
  getResiduo,
  setIsUpdate,
  setResiduoSelected,
} from "../../../redux/features/residuoSlice";
import { GENERADO_RESIDUO } from "../../../Utils/constants";

const TableButtonResiduos = ({
  values,
  onOpenEliminar,
  onOpenCreateUpdate,
}) => {
  const dispatch = useDispatch();

  const handleUpdate = () => {
    const { id } = values;
    dispatch(getResiduo(id));
    dispatch(setIsUpdate(true));
    onOpenCreateUpdate();
  };

  const handleOnClick = () => {
    onOpenEliminar();
    dispatch(setResiduoSelected(values));
  };

  const items = [
    {
      name: "Editar residuo",
      onClick: handleUpdate,
      hidden: values.estado !== GENERADO_RESIDUO,
    },
    {
      name: "Eliminar residuo",
      onClick: handleOnClick,
      hidden: false,
    },
  ];

  return <TableButton items={items}></TableButton>;
};

export default TableButtonResiduos;

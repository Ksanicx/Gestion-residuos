import React from "react";

// components
import TableButton from "./TableButton";

// redux
import { useDispatch } from "react-redux";
import {
  getRuta,
  setRutaSelected,
  setIsUpdate,
} from "../../../redux/features/rutaSlice";

const TableButtonRuta = ({ values, onOpenEliminar, onOpenCreateUpdate }) => {
  const dispatch = useDispatch();

  const handleUpdate = () => {
    const { id } = values;
    dispatch(getRuta(id));
    dispatch(setIsUpdate(true));
    onOpenCreateUpdate();
  };

  const handleOnClick = () => {
    onOpenEliminar();
    dispatch(setRutaSelected(values));
  };

  const items = [
    {
      name: "Editar ruta",
      onClick: handleUpdate,
      hidden: false,
    },
    {
      name: "Eliminar ruta",
      onClick: handleOnClick,
      hidden: false,
    },
  ];

  return <TableButton items={items}></TableButton>;
};

export default TableButtonRuta;

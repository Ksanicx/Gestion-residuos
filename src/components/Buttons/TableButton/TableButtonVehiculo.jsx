import React from "react";

// components
import TableButton from "./TableButton";

// redux
import { useDispatch } from "react-redux";
import {
  getVehiculo,
  setIsUpdate,
  setVehiculoSelected,
} from "../../../redux/features/vehiculoSlice";

const TableButtonVehiculo = ({
  values,
  onOpenEliminar,
  onOpenCreateUpdate,
}) => {
  const dispatch = useDispatch();

  const handleUpdate = () => {
    const { id } = values;
    dispatch(getVehiculo(id));
    dispatch(setIsUpdate(true));
    onOpenCreateUpdate();
  };

  const handleOnClick = () => {
    onOpenEliminar();
    dispatch(setVehiculoSelected(values));
  };
  const items = [
    {
      name: "Editar vehículo",
      onClick: handleUpdate,
      hidden: false,
    },
    {
      name: "Cambiar estado",
      onClick: handleOnClick,
      hidden: false,
    },
  ];

  return <TableButton items={items}></TableButton>;
};

export default TableButtonVehiculo;

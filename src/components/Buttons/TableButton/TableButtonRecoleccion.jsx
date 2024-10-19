import React from "react";
import TableButton from "./TableButton";
import {
  GENERADO_RESIDUO,
  RECOLECTADO_RESIDUO,
} from "../../../Utils/constants";
import { useDispatch } from "react-redux";
import { getRecoleccion } from "../../../redux/features/recoleccionSlice";

const TableButtonRecoleccion = ({
  row,
  setVentaID,
  onOpen,
  onOpen2,
  onOpen4,
  onOpen5,
  setIsView,
}) => {
  const dispatch = useDispatch();
  const items = [
    {
      name: "Ver detalles",
      onClick: () => {
        setVentaID(row.values.id);
        setIsView(true);
        dispatch(getRecoleccion(row.values.id));
        onOpen2();
      },
      hidden: row.values.estado === GENERADO_RESIDUO,
    },
    {
      name: "Administrar",
      onClick: () => {
        setVentaID(row.values.id);
        dispatch(getRecoleccion(row.values.id));
        setIsView(false);
        onOpen2();
      },
      hidden: row.values.estado !== GENERADO_RESIDUO,
    },
    {
      name: "Marcar como finalizado",
      onClick: () => {
        onOpen5();
        setVentaID(row.values.id);
      },
      hidden: row.values.estado !== RECOLECTADO_RESIDUO,
    },
    {
      name: "Marcar como no recolectado",
      onClick: () => {
        onOpen4();
        setVentaID(row.values.id);
      },
      hidden: row.values.estado !== GENERADO_RESIDUO,
    },
    {
      name: "Cancelar recolección",
      onClick: () => {
        onOpen();
        setVentaID(row.values.id);
      },
      hidden: row.values.estado !== GENERADO_RESIDUO,
    },
  ];

  return <TableButton items={items}></TableButton>;
};

export default TableButtonRecoleccion;

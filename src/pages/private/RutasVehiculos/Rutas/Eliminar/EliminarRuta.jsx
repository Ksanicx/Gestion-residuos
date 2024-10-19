import React from "react";

// components
import ModalAlert from "../../../../../components/Modal/ModalAlert";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  eliminarRuta,
  selectRutaSelected,
} from "../../../../../redux/features/rutaSlice";

const EliminarRuta = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const rutaSelected = useSelector(selectRutaSelected);

  const handleOnContinue = () => {
    dispatch(eliminarRuta(rutaSelected.id));
  };
  return (
    <ModalAlert
      subTitleText={`Estas por eliminar la ruta ${rutaSelected?.nombre_ruta}.`}
      description="Al eliminar la ruta, ya no podras recuperarlo, "
      emphasisDescription="esta accion no se podrá revertir."
      isOpen={isOpen}
      onClose={onClose}
      onContinue={handleOnContinue}
    />
  );
};

export default EliminarRuta;

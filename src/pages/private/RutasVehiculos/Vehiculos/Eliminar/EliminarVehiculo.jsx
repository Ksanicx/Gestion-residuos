import React from "react";

// components
import ModalAlert from "../../../../../components/Modal/ModalAlert";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  eliminarVehiculo,
  selectVehiculoSelected,
} from "../../../../../redux/features/vehiculoSlice";

const EliminarVehiculo = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const vehiculoSelected = useSelector(selectVehiculoSelected);

  const handleOnContinue = () => {
    dispatch(
      eliminarVehiculo({
        id: vehiculoSelected?.id,
        stauts: vehiculoSelected?.active,
      })
    );
  };
  return (
    <ModalAlert
      subTitleText={`Estas por eliminar el vehiculo ${vehiculoSelected?.placa}.`}
      description="Al eliminar el vehiculo, ya no podras recuperarlo, "
      emphasisDescription="esta accion no se podrá revertir."
      isOpen={isOpen}
      onClose={onClose}
      onContinue={handleOnContinue}
    />
  );
};

export default EliminarVehiculo;

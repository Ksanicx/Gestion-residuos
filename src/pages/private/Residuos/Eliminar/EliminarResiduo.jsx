import React from "react";

// components
import ModalAlert from "../../../../components/Modal/ModalAlert";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  eliminarResiduo,
  selectResiduoSelected,
} from "../../../../redux/features/residuoSlice";

const EliminarResiduo = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const residuoSelected = useSelector(selectResiduoSelected);

  const handleOnContinue = () => {
    dispatch(eliminarResiduo(residuoSelected.id));
  };
  return (
    <ModalAlert
      subTitleText={"Estas por eliminar el residuo"}
      description="Al eliminar el resdiuo, ya no podras recuperarlo, "
      emphasisDescription="esta accion no se podrá revertir."
      isOpen={isOpen}
      onClose={onClose}
      onContinue={handleOnContinue}
    />
  );
};

export default EliminarResiduo;

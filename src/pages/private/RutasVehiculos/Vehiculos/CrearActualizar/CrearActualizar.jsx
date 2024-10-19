import React, { useEffect } from "react";

// react-hook-form
import { useForm } from "react-hook-form";

// chakra
import { Skeleton } from "@chakra-ui/react";

// redux
import { useDispatch, useSelector } from "react-redux";

import {
  createVehiculo,
  loadingActions,
  selectVehiculoDataUpdate,
  selectIsUpdate,
  updateVehiculo,
} from "../../../../../redux/features/vehiculoSlice";

// components
import ModalForm from "../../../../../components/Modal/ModalForm";
import VehiculoForm from "./VehiculoForm";

const CrearActualizar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  // selectores de redux
  const vehiculoSelected = useSelector(selectVehiculoDataUpdate);
  const loading = useSelector(loadingActions);
  const isUpdate = useSelector(selectIsUpdate);
  const modalTitle = isUpdate ? "Editar Vehículo" : "Nuevo Vehículo";
  const buttonTitle = isUpdate ? "Actualizar Vehículo" : "Agregar Vehículo";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  const loading_save = useSelector(loadingActions);

  const onSubmit = (data) => {
    if (isUpdate) {
      dispatch(updateVehiculo({ ...data, onClose, reset }));
    } else {
      dispatch(createVehiculo({ ...data, onClose, reset }));
    }
  };

  useEffect(() => {
    if (isUpdate) {
      reset(vehiculoSelected);
    } else {
      reset({});
    }
  }, [isUpdate, vehiculoSelected]);

  return (
    <>
      <ModalForm
        titleModal={modalTitle}
        isOpen={isOpen}
        onClose={onClose}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        textButtonClose="Cancelar"
        textButtonSubmit={buttonTitle}
        loadingButtonSubmit={loading_save}
      >
        {loading && isUpdate ? (
          <>
            <Skeleton
              height="80px"
              boxShadow="card"
              borderRadius="10px"
              startColor="brand.disabled"
              endColor="brand.gray3"
            />
            <Skeleton
              height="80px"
              boxShadow="card"
              borderRadius="10px"
              startColor="brand.disabled"
              endColor="brand.gray3"
            />
          </>
        ) : (
          <VehiculoForm errors={errors} register={register} control={control} />
        )}
      </ModalForm>
    </>
  );
};

export default CrearActualizar;

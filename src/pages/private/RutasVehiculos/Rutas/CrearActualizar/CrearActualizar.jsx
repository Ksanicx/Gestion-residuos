import React, { useEffect } from "react";

// react-hook-form
import { useForm } from "react-hook-form";

// chakra
import { Skeleton } from "@chakra-ui/react";

// redux
import { useDispatch, useSelector } from "react-redux";

import {
  createRuta,
  selectLoadingActions,
  selectIsUpdate,
  selectRutaDataUpdate,
  updateRuta,
} from "../../../../../redux/features/rutaSlice";

// components
import ModalForm from "../../../../../components/Modal/ModalForm";
import RutaForm from "./RutaForm";

const CrearActualizar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  // selectores de redux
  const rutaSelected = useSelector(selectRutaDataUpdate);
  const loading = useSelector(selectLoadingActions);
  const isUpdate = useSelector(selectIsUpdate);
  const modalTitle = isUpdate ? "Editar Ruta" : "Nueva Ruta";
  const buttonTitle = isUpdate ? "Actualizar Ruta" : "Agregar Ruta";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  const loading_save = useSelector(selectLoadingActions);

  const onSubmit = (data) => {
    if (isUpdate) {
      dispatch(updateRuta({ ...data, onClose, reset }));
    } else {
      dispatch(createRuta({ ...data, onClose, reset }));
    }
  };

  useEffect(() => {
    if (isUpdate) {
      reset(rutaSelected);
    } else {
      reset({});
    }
  }, [isUpdate, rutaSelected]);

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
          <RutaForm errors={errors} register={register} control={control} />
        )}
      </ModalForm>
    </>
  );
};

export default CrearActualizar;

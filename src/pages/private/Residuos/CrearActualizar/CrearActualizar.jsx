import React, { useEffect } from "react";

// react-hook-form
import { useForm } from "react-hook-form";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  createResiduo,
  loadingActions,
  selectIsUpdate,
  selectResiduoSelected,
  updateResiduo,
} from "../../../../redux/features/residuoSlice";

// components
import ResiduosForm from "./ResiduosForm";
import ModalForm from "../../../../components/Modal/ModalForm";
import { Skeleton } from "@chakra-ui/react";

const CrearActualizar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  // selectores de redux
  const residuoSelected = useSelector(selectResiduoSelected);
  const loading = useSelector(loadingActions);
  const isUpdate = useSelector(selectIsUpdate);
  const modalTitle = isUpdate ? "Editar Residuo" : "Nuevo Residuo";
  const buttonTitle = isUpdate ? "Actualizar Residuo" : "Nuevo Residuo";

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
      dispatch(updateResiduo({ ...data, onClose, reset }));
    } else {
      dispatch(createResiduo({ ...data, onClose, reset }));
    }
  };

  useEffect(() => {
    if (isUpdate) {
      reset(residuoSelected);
    } else {
      reset({});
    }
  }, [isUpdate, residuoSelected]);

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
        isCentered={false}
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
          <ResiduosForm errors={errors} register={register} control={control} />
        )}
      </ModalForm>
    </>
  );
};

export default CrearActualizar;

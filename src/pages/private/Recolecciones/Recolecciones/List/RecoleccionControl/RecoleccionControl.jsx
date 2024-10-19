import React, { useEffect } from "react";
import ModalFormMultiStep from "../../../../../../components/Modal/ModalFormMultiStep";
import {
  changeRecoleccionState,
  selectLoadingActions,
  selectLoadingRecolecciones,
  selectRecoleccionSelected,
} from "../../../../../../redux/features/recoleccionSlice";
import Detalle from "./Forms/DetalleRecoleccion";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { RECOLECTADO_RESIDUO } from "../../../../../../Utils/constants";

const OrdenControl = ({ isOpen, onClose, isView }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm();

  const dispatch = useDispatch();

  const loading = useSelector(selectLoadingRecolecciones);
  const orderSelected = useSelector(selectRecoleccionSelected);
  const loadingActtions = useSelector(selectLoadingActions);

  const onSubmit = async (data) => {
    dispatch(
      changeRecoleccionState({
        id: orderSelected.id,
        status: RECOLECTADO_RESIDUO,
        monto_cobrado: data.monto_cobrado || 0,
        comentario_reciclador: data.comentario_reciclador || "",
        fecha_recoleccion_reciclador: data.fecha_recoleccion_reciclador || "",
        ruta: data.ruta,
      })
    );
    onClose();
  };

  const steps = [{ label: "Detalles de la recoleccion" }];

  const forms = [
    <Detalle
      loading={loading}
      orderSelected={orderSelected}
      errors={errors}
      register={register}
      control={control}
      reset={reset}
      key={"form-detalle"}
      isView={isView}
      getValues={getValues}
      setValue={setValue}
    />,
  ];

  const datos_pago = orderSelected?.datos_pago;

  useEffect(() => {
    reset(datos_pago);
  }, [orderSelected]);

  return (
    <ModalFormMultiStep
      titleModal={"Recolección de residuos"}
      isOpen={isOpen}
      onClose={onClose}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      textButtonClose={isView ? "Cerrar" : "Cancelar"}
      textButtonSubmit={"Guardar"}
      loadingButtonSubmit={loadingActtions}
      isCentered={false}
      steps={steps}
      forms={forms}
      loading={loadingActtions}
      errors={errors}
      notGrid
      isView={isView}
    />
  );
};

export default OrdenControl;

import React, { useEffect } from "react";
import Table from "../../../../components/Table";

// hooks
import useColumns from "../../../../hooks/useColumns";

// utils
import { columns } from "./columns";

// redux
import {
  generateExcel,
  getRecolecciones,
  nextPage,
  prevPage,
  selectLoadingExcel,
  selectLoadingRecolecciones,
  selectPage,
  selectRecolecciones,
} from "../../../../redux/features/recoleccionSlice";
import { useDispatch, useSelector } from "react-redux";
import HeaderViewContent from "../../../../components/HeaderViewContent";

const ReportesList = () => {
  const dispatch = useDispatch();

  // columnas de la tabla
  const columnsRender = useColumns(columns());

  // selectores de redux
  const loading = useSelector(selectLoadingRecolecciones);
  const recoleccionesData = useSelector(selectRecolecciones);
  const page = useSelector(selectPage);
  const loadingExcel = useSelector(selectLoadingExcel);

  const nextPageTable = () => {
    dispatch(nextPage());
    dispatch(getRecolecciones({ isNextPage: true, isPrevPage: false }));
  };

  const prevPageTable = () => {
    dispatch(prevPage());
    dispatch(getRecolecciones({ isNextPage: false, isPrevPage: true }));
  };

  useEffect(() => {
    dispatch(getRecolecciones({ isNextPage: false, isPrevPage: false }));
  }, [dispatch]);

  return (
    <>
      <HeaderViewContent
        titleView="Reporte de recolecciones"
        showCreateButton={false}
        showSearchButton={false}
        showFilterButton={false}
        showExcelButton
        onClickExcel={() => dispatch(generateExcel({}))}
        loadingExcel={loadingExcel}
      />

      <Table
        columns={columnsRender}
        data={recoleccionesData}
        loading={loading}
        page={page}
        prevPageTable={prevPageTable}
        nextPageTable={nextPageTable}
        isSubModuleLoading
      />
    </>
  );
};

export default ReportesList;

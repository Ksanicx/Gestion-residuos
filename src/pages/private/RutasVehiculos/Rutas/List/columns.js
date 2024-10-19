import { TableButtonRuta } from "../../../../../components/Buttons/TableButton";

export const columns = (onOpenEliminar, onOpenCreateUpdate) => [
  {
    Header: "Nombre",
    accessor: "nombre_ruta",
  },
  {
    Header: "Descripción",
    accessor: "descripcion_ruta",
  },
  {
    Header: "Acciones",
    accessor: "id",
    Cell: ({ row: { values } }) => (
      <TableButtonRuta
        values={values}
        onOpenEliminar={onOpenEliminar}
        onOpenCreateUpdate={onOpenCreateUpdate}
      />
    ),
  },
];

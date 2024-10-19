import { TableButtonResiduos } from "../../../../components/Buttons/TableButton";
import Badge from "../../../../components/Badge/Badge";
import { convertStatus } from "../../../../Utils/functions";
export const columns = (onOpenEliminar, onOpenCreateUpdate) => [
  {
    Header: "Fecha de recolección",
    accessor: "fecha_recoleccion",
  },
  {
    Header: "Ubicación",
    accessor: "ubicacion",
  },
  {
    Header: "Comentario",
    accessor: (value) =>
      value.comentario ? value.comentario : "Sin comentario",
  },
  {
    Header: "Estado de la recolección",
    accessor: "estado",
    Cell: ({ value }) => {
      return (
        <Badge
          textContent={convertStatus(value)?.name}
          colorScheme={convertStatus(value)?.color}
        />
      );
    },
  },
  {
    Header: "Acciones",
    accessor: "id",
    Cell: ({ row: { values } }) => (
      <TableButtonResiduos
        values={values}
        onOpenEliminar={onOpenEliminar}
        onOpenCreateUpdate={onOpenCreateUpdate}
      />
    ),
  },
];
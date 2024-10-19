import Badge from "../../../../../components/Badge/Badge";
import { TableButtonRecoleccion } from "../../../../../components/Buttons/TableButton";
import { convertStatus } from "../../../../../Utils/functions";

export const columns = (
  onOpen,
  onOpen2,
  onOpen4,
  onOpen5,
  setIsView,
  setVentaID
) => [
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
    Cell: ({ row }) => (
      <TableButtonRecoleccion
        row={row}
        onOpen={onOpen}
        onOpen2={onOpen2}
        onOpen4={onOpen4}
        onOpen5={onOpen5}
        setIsView={setIsView}
        setVentaID={setVentaID}
      />
    ),
  },
];

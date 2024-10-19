import Badge from "../../../../../components/Badge/Badge";
import { TableButtonVehiculo } from "../../../../../components/Buttons/TableButton";

export const columns = (onOpenEliminar, onOpenCreateUpdate) => [
  {
    Header: "Placa",
    accessor: "placa",
  },
  {
    Header: "Tipo",
    accessor: "tipo.value",
  },
  {
    Header: "Estado",
    accessor: "active",
    Cell: ({ value }) => (
      <Badge
        textContent={value ? "Activo" : "Inactivo"}
        colorScheme={value ? "blue" : "red"}
      />
    ),
  },
  {
    Header: "Acciones",
    accessor: "id",
    Cell: ({ row: { values } }) => (
      <TableButtonVehiculo
        values={values}
        onOpenEliminar={onOpenEliminar}
        onOpenCreateUpdate={onOpenCreateUpdate}
      />
    ),
  },
];

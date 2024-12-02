// app/components/Table/TableList.tsx
import React from "react";
import TableItem from "./TableItem";

interface TableListProps {
  tables: number[];
  reservedTables: number[];
  selectedTable: number | null;
  onTableSelect: (tableNumber: number) => void;
  reservations: { tableNumber: number; userId: string; isReserved: boolean }[];
  userName: string | null;
  disabled: boolean;
  isBlocked: boolean; // Keep this if you want to use it
}

const TableList: React.FC<TableListProps> = ({
  tables,
  reservedTables,
  selectedTable,
  onTableSelect,
  reservations,
  userName,
  disabled,
  isBlocked // Keep this if you want to use it
}) => {
  return (
    <div className="flex flex-wrap justify-center mt-4 mb-5" style={{ cursor: "pointer" }}>
      {tables
        .filter((tableNumber) => !reservedTables.includes(tableNumber))
        .map((tableNumber) => {
          const isReserved = reservations.some(
            (res) => res.tableNumber === tableNumber && res.isReserved
          );
          const reservedBy = reservations.find(
            (res) => res.tableNumber === tableNumber
          )?.userId || null;

          return (
            <TableItem
              key={tableNumber}
              number={tableNumber}
              isSelected={selectedTable === tableNumber}
              onClick={onTableSelect}
              isReserved={isReserved && reservedBy !== userName}
              disabled={disabled}
              isBlocked={isBlocked} // Pass the isBlocked prop
            />
          );
        })}
    </div>
  );
};

export default TableList;
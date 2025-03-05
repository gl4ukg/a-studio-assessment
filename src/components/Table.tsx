import React from "react";

interface Column {
  key: string;
  header: string;
}

interface TableProps {
  data: any[];
  columns: Column[];
}

const Table: React.FC<TableProps> = ({ data, columns }) => {
  return (
    <table className="w-full border-collapse text-sm font-neutra">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className="bg-blue border border-2 border-gray-200 p-4 uppercase text-black font-bold">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-200 transition-colors">
            {columns.map((column) => (
              <td key={`${item.id}-${column.key}`} className="border border-2 border-gray-200 py-2 px-4">
                {item[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;

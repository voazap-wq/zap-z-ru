
import React from 'react';
import { useSortableData } from '../../hooks/useSortableData';

export interface TableColumn<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
}

const DataTable = <T extends { id: any }>({ columns, data }: DataTableProps<T>) => {
  const { items, requestSort, sortConfig } = useSortableData(data);

  const getSortDirectionIcon = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="material-icons text-gray-400 text-sm">unfold_more</span>;
    }
    if (sortConfig.direction === 'ascending') {
      return <span className="material-icons text-sm">expand_less</span>;
    }
    return <span className="material-icons text-sm">expand_more</span>;
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} scope="col" className="px-6 py-3">
                <button
                  className="flex items-center space-x-1"
                  onClick={() => requestSort(col.key as keyof T)}
                >
                  <span>{col.header}</span>
                  {getSortDirectionIcon(col.key as keyof T)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
              {columns.map(col => (
                <td key={String(col.key)} className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Нет данных для отображения.
          </div>
      )}
    </div>
  );
};

export default DataTable;
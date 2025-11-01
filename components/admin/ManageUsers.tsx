
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, UserRole } from '../../types';
import DataTable from './DataTable';
import { TableColumn } from './DataTable';
import ConfirmDialog from '../ui/ConfirmDialog';

const ManageUsers: React.FC = () => {
  const { users, user, updateUserRole, deleteUser } = useAppContext();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };
  
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
      if (user?.id === userId) {
          alert("Вы не можете изменить свою собственную роль.");
          return;
      }
      updateUserRole(userId, newRole);
  };

  const columns: TableColumn<User>[] = useMemo(() => [
    { key: 'fullName', header: 'Имя' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Роль',
      render: (item) => (
        <select
          value={item.role}
          onChange={(e) => handleRoleChange(item.id, e.target.value as UserRole)}
          disabled={user?.id === item.id}
          className="p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary"
        >
          <option value="customer">customer</option>
          <option value="manager">manager</option>
          <option value="superadmin">superadmin</option>
        </select>
      )
    },
    {
      key: 'id',
      header: 'Действия',
      render: (item) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleDelete(item)} 
            disabled={user?.id === item.id}
            className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <span className="material-icons text-xl">delete</span>
          </button>
        </div>
      ),
    },
  ], [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Управление пользователями</h1>
      <DataTable columns={columns} data={users} />
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Удалить пользователя?"
      >
        Вы уверены, что хотите удалить пользователя {userToDelete?.fullName}? Это действие необратимо.
      </ConfirmDialog>
    </div>
  );
};

export default ManageUsers;

import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import AddVehicleDialog from './AddVehicleDialog';
import ConfirmDialog from '../ui/ConfirmDialog';

const MyGarage: React.FC = () => {
  const { vehicles, addVehicle, deleteVehicle } = useAppContext();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const handleDeleteConfirm = async () => {
    if (vehicleToDelete) {
      await deleteVehicle(vehicleToDelete.id);
      setVehicleToDelete(null);
    }
  };
  
  return (
    <div>
        <div className="flex justify-end mb-4">
            <Button onClick={() => setAddDialogOpen(true)}>
                <span className="material-icons mr-2 -ml-1">add</span>
                Добавить транспорт
            </Button>
        </div>
      {vehicles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="material-icons text-5xl text-gray-400">no_crash</span>
          <p className="mt-2 text-gray-600 dark:text-gray-400">В вашем гараже пока нет транспортных средств.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map(vehicle => (
            <Card key={vehicle.id} className="p-4 flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.year} год</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">VIN: {vehicle.vin}</p>
                </div>
                <div className="flex items-center">
                    <Button variant="text" className="!py-1 !px-2 mr-1">Подобрать</Button>
                    <IconButton onClick={() => setVehicleToDelete(vehicle)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                        <span className="material-icons text-xl">delete_outline</span>
                    </IconButton>
                </div>
            </Card>
          ))}
        </div>
      )}
      <AddVehicleDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddVehicle={addVehicle}
      />
      <ConfirmDialog
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить транспорт?"
      >
        Вы уверены, что хотите удалить {vehicleToDelete?.make} {vehicleToDelete?.model} из вашего гаража? Это действие необратимо.
      </ConfirmDialog>
    </div>
  );
};

export default MyGarage;
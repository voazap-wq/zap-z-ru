import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Dialog from '../ui/Dialog';

interface GarageSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (vin: string) => void;
}

const GarageSelectionDialog: React.FC<GarageSelectionDialogProps> = ({ isOpen, onClose, onSelect }) => {
  const { vehicles: allVehicles, user } = useAppContext();
  const userVehicles = user ? allVehicles.filter(v => v.userId === user.id) : [];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Выберите автомобиль из гаража">
      {userVehicles.length > 0 ? (
        <div className="space-y-2">
          {userVehicles.map(vehicle => (
            <div 
              key={vehicle.id} 
              onClick={() => onSelect(vehicle.vin)}
              className="p-3 cursor-pointer rounded-md border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <p className="font-semibold">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
              <p className="text-sm text-gray-500 font-mono">{vehicle.vin}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">В вашем гараже нет автомобилей.</p>
      )}
    </Dialog>
  );
};

export default GarageSelectionDialog;
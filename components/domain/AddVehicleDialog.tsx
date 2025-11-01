
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Vehicle } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';

interface AddVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Correctly type onAddVehicle to omit userId, which is handled by the context.
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId'>) => Promise<void>;
}

// FIX: Correctly type FormData to omit userId.
type FormData = Omit<Vehicle, 'id' | 'userId'>;

const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({ isOpen, onClose, onAddVehicle }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // Convert year to number before submitting
    const vehicleData = { ...data, year: Number(data.year) };
    await onAddVehicle(vehicleData);
    handleClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Добавить транспорт">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          id="make"
          label="Марка"
          register={register('make', { required: 'Введите марку' })}
          // FIX: Cast error to 'any' to resolve react-hook-form type incompatibility.
          error={errors.make as any}
          placeholder="e.g., Toyota"
        />
        <TextField
          id="model"
          label="Модель"
          register={register('model', { required: 'Введите модель' })}
          // FIX: Cast error to 'any' to resolve react-hook-form type incompatibility.
          error={errors.model as any}
          placeholder="e.g., Camry"
        />
        <TextField
          id="year"
          label="Год выпуска"
          type="number"
          register={register('year', { 
            required: 'Введите год',
            min: { value: 1900, message: 'Неверный год' },
            max: { value: new Date().getFullYear() + 1, message: 'Неверный год' }
          })}
          // FIX: Cast error to 'any' to resolve react-hook-form type incompatibility.
          error={errors.year as any}
          placeholder="e.g., 2021"
        />
        <TextField
          id="vin"
          label="VIN-номер"
          register={register('vin', { required: 'Введите VIN' })}
          // FIX: Cast error to 'any' to resolve react-hook-form type incompatibility.
          error={errors.vin as any}
          helperText="Можно найти в СТС"
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={handleClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Добавление...' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddVehicleDialog;
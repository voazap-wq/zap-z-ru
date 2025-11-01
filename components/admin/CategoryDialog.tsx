
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Category } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

type FormData = Omit<Category, 'id'>;

const CategoryDialog: React.FC<CategoryDialogProps> = ({ isOpen, onClose, category }) => {
  const { createCategory, updateCategory } = useAppContext();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting, touchedFields }, 
    reset, 
    setValue, 
    watch 
  } = useForm<FormData>();
  
  const isEditing = !!category;
  const nameValue = watch('name');

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset(category);
      } else {
        reset({
            name: '',
            slug: '',
            imageUrl: 'https://picsum.photos/seed/newcategory/400/300'
        });
      }
    }
  }, [isOpen, category, reset]);
  
  useEffect(() => {
    // Automatically generate slug from name, but only if user hasn't manually edited it.
    if (nameValue && !touchedFields.slug) {
      const slug = nameValue.toLowerCase()
        .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g').replace(/д/g, 'd')
        .replace(/е/g, 'e').replace(/ё/g, 'e').replace(/ж/g, 'zh').replace(/з/g, 'z').replace(/и/g, 'i')
        .replace(/й/g, 'y').replace(/к/g, 'k').replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n')
        .replace(/о/g, 'o').replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
        .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'c').replace(/ч/g, 'ch')
        .replace(/ш/g, 'sh').replace(/щ/g, 'sch').replace(/ъ/g, '').replace(/ы/g, 'y').replace(/ь/g, '')
        .replace(/э/g, 'e').replace(/ю/g, 'yu').replace(/я/g, 'ya')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('slug', slug, { shouldValidate: true, shouldDirty: true });
    }
  }, [nameValue, touchedFields.slug, setValue]);


  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isEditing) {
      await updateCategory(category.id, data);
    } else {
      await createCategory(data);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать категорию' : 'Добавить категорию'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField 
            id="name" 
            label="Название" 
            register={register('name', { required: 'Введите название' })}
            // FIX: Cast error to 'any' to resolve react-hook-form type incompatibility.
            error={errors.name as any} 
        />
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="slug" label="Slug (URL)" register={register('slug', { required: 'Введите slug' })} error={errors.slug as any} />
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="imageUrl" label="URL изображения" register={register('imageUrl', { required: 'Введите URL' })} error={errors.imageUrl as any} />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CategoryDialog;
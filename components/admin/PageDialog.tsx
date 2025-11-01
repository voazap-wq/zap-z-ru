import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Page } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';

interface PageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  page: Page | null;
}

type FormData = Omit<Page, 'id'>;

const PageDialog: React.FC<PageDialogProps> = ({ isOpen, onClose, page }) => {
  const { createPage, updatePage } = useAppContext();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  
  const isEditing = !!page;

  useEffect(() => {
    if (isOpen) {
      if (page) {
        reset(page);
      } else {
        reset({
            title: '',
            slug: '',
            content: '',
            showInHeader: false,
            showInFooter: false
        });
      }
    }
  }, [isOpen, page, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isEditing) {
      await updatePage(page.id, data);
    } else {
      await createPage(data);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать страницу' : 'Добавить страницу'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="title" label="Заголовок" register={register('title', { required: 'Введите заголовок' })} error={errors.title as any} />
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="slug" label="Slug (URL)" register={register('slug', { required: 'Введите slug' })} error={errors.slug as any} />
        <div>
            <label htmlFor="content" className="block text-sm font-medium">Содержимое</label>
            <textarea id="content" {...register('content')} rows={5} className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
                <input type="checkbox" {...register('showInHeader')} className="h-4 w-4 rounded border-gray-300 text-primary" />
                <span className="ml-2">Показывать в шапке</span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input type="checkbox" {...register('showInFooter')} className="h-4 w-4 rounded border-gray-300 text-primary" />
                <span className="ml-2">Показывать в подвале</span>
            </label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default PageDialog;

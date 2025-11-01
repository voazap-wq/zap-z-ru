import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { NewsArticle } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';

interface NewsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
}

type FormData = Omit<NewsArticle, 'id' | 'createdAt'>;

const NewsDialog: React.FC<NewsDialogProps> = ({ isOpen, onClose, article }) => {
  const { createNews, updateNews } = useAppContext();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  
  const isEditing = !!article;

  useEffect(() => {
    if (isOpen) {
      if (article) {
        reset(article);
      } else {
        reset({
            title: '',
            excerpt: '',
            content: '',
            imageUrl: 'https://picsum.photos/seed/newnews/400/300'
        });
      }
    }
  }, [isOpen, article, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isEditing) {
      await updateNews(article.id, data);
    } else {
      await createNews(data);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать новость' : 'Добавить новость'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="title" label="Заголовок" register={register('title', { required: 'Введите заголовок' })} error={errors.title as any} />
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="excerpt" label="Отрывок" register={register('excerpt', { required: 'Введите отрывок' })} error={errors.excerpt as any} />
        <div>
            <label htmlFor="content" className="block text-sm font-medium">Содержимое</label>
            <textarea
                id="content"
                {...register('content', { required: 'Введите содержимое' })}
                rows={5}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>
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

export default NewsDialog;

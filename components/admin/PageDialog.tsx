import React, { useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { Page, PageBlock } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';
import IconButton from '../ui/IconButton';

interface PageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  page: Page | null;
}

type FormData = Omit<Page, 'id'>;

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const PageDialog: React.FC<PageDialogProps> = ({ isOpen, onClose, page }) => {
  const { createPage, updatePage } = useAppContext();
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "content" });
  
  const isEditing = !!page;

  useEffect(() => {
    if (isOpen) {
      if (page) {
        reset(page);
      } else {
        reset({
            title: '',
            slug: '',
            content: [],
            showInHeader: false,
            showInFooter: false
        });
      }
    }
  }, [isOpen, page, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const finalData = {
        ...data,
        content: data.content.map(block => {
            if(block.type === 'products') {
                const rawIds = block.productIds;
                const productIdsAsArray = typeof rawIds === 'string'
                    ? rawIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
                    : (Array.isArray(rawIds) ? rawIds.map(Number).filter(id => !isNaN(id)) : []);
                
                return {
                    ...block,
                    productIds: productIdsAsArray
                }
            }
            return block;
        })
    };

    if (isEditing) {
      await updatePage(page.id, finalData);
    } else {
      await createPage(finalData);
    }
    onClose();
  };
  
  const addBlock = (type: PageBlock['type']) => {
    let newBlock: PageBlock;
    switch(type) {
        case 'image':
            newBlock = { id: generateId(), type, src: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60', alt: 'Новое изображение' };
            break;
        case 'button':
            newBlock = { id: generateId(), type, text: 'Нажми меня', link: '#', variant: 'contained' };
            break;
        case 'products':
            newBlock = { id: generateId(), type, title: 'Рекомендуемые товары', productIds: [] };
            break;
        case 'text':
        default:
            newBlock = { id: generateId(), type: 'text', content: 'Новый текстовый блок. Вы можете использовать Markdown для форматирования.' };
            break;
    }
    append(newBlock);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать страницу' : 'Создать страницу'} className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField id="title" label="Заголовок" register={register('title', { required: 'Введите заголовок' })} error={errors.title as any} />
            <TextField id="slug" label="Slug (URL)" register={register('slug', { required: 'Введите slug' })} error={errors.slug as any} />
        </div>
        
        <div className="space-y-3 pt-4 border-t dark:border-gray-700">
            <h3 className="font-medium">Конструктор контента</h3>
            {fields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 flex space-x-3">
                    <div className="flex flex-col items-center space-y-1">
                         <IconButton onClick={() => move(index, index - 1)} disabled={index === 0} className="!p-1"><span className="material-icons text-lg">arrow_upward</span></IconButton>
                         <IconButton onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} className="!p-1"><span className="material-icons text-lg">arrow_downward</span></IconButton>
                         <IconButton onClick={() => remove(index)} className="!p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"><span className="material-icons text-lg">delete</span></IconButton>
                    </div>
                    <div className="flex-grow space-y-2">
                        {field.type === 'text' && (
                             <div>
                                <label className="text-xs font-semibold text-gray-500">Текстовый блок</label>
                                <textarea {...register(`content.${index}.content`)} rows={4} className="w-full mt-1 text-sm p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" />
                             </div>
                        )}
                        {field.type === 'image' && (
                             <div>
                                <label className="text-xs font-semibold text-gray-500">Изображение</label>
                                <div className="space-y-2 mt-1">
                                    <TextField id={`content.${index}.src`} label="URL изображения" register={register(`content.${index}.src`)} className="text-sm !py-1.5" />
                                    <TextField id={`content.${index}.alt`} label="Alt текст" register={register(`content.${index}.alt`)} className="text-sm !py-1.5" />
                                </div>
                             </div>
                        )}
                         {field.type === 'button' && (
                             <div>
                                <label className="text-xs font-semibold text-gray-500">Кнопка</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    <TextField id={`content.${index}.text`} label="Текст" register={register(`content.${index}.text`)} className="text-sm !py-1.5" />
                                    <TextField id={`content.${index}.link`} label="Ссылка (URL)" register={register(`content.${index}.link`)} className="text-sm !py-1.5" />
                                     <Controller
                                        name={`content.${index}.variant`}
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                            <label className="block text-sm font-medium mb-1">Стиль</label>
                                            <select {...field} className="w-full text-sm px-3 py-1.5 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600">
                                                <option value="contained">Основной</option>
                                                <option value="outlined">Контурный</option>
                                            </select>
                                            </div>
                                        )}
                                    />
                                </div>
                             </div>
                        )}
                        {field.type === 'products' && (
                             <div>
                                <label className="text-xs font-semibold text-gray-500">Сетка товаров</label>
                                <div className="grid grid-cols-1 gap-2 mt-1">
                                    <TextField id={`content.${index}.title`} label="Заголовок блока" register={register(`content.${index}.title`)} className="text-sm !py-1.5" />
                                    <TextField id={`content.${index}.productIds`} label="ID товаров" register={register(`content.${index}.productIds` as any)} className="text-sm !py-1.5" helperText="Введите ID товаров через запятую (напр. 1, 5, 8)" />
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            ))}
            <div className="flex items-center space-x-2 pt-2">
                <span className="text-sm font-medium">Добавить блок:</span>
                <Button type="button" variant="outlined" onClick={() => addBlock('text')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">text_fields</span>Текст</Button>
                <Button type="button" variant="outlined" onClick={() => addBlock('image')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">image</span>Изображение</Button>
                <Button type="button" variant="outlined" onClick={() => addBlock('button')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">smart_button</span>Кнопка</Button>
                <Button type="button" variant="outlined" onClick={() => addBlock('products')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">grid_view</span>Товары</Button>
            </div>
        </div>


        <div className="space-y-2 pt-4 border-t dark:border-gray-700">
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
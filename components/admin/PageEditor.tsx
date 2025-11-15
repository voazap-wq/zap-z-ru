import React, { useEffect, useState, useRef } from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { Page, PageBlock, ColumnsBlock } from '../../types';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';
import IconButton from '../ui/IconButton';
import Card from '../ui/Card';
import ImageDropzone from '../ui/ImageDropzone';

interface PageEditorProps {
  page: Page;
  onFinish: () => void;
}

type FormData = Omit<Page, 'id'>;

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- Sub-components for block types ---

const TextBlockEditor: React.FC<{ nestIndex: string, control: any }> = ({ nestIndex, control }) => {
    const { register } = useForm(); // Use a dummy one to get register
    return (
        <div>
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Текстовый блок</label>
            <textarea {...register(`${nestIndex}.content` as const)} rows={5} className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary" placeholder="Поддерживается Markdown..." />
        </div>
    );
};

const ImageBlockEditor: React.FC<{ nestIndex: string, control: any }> = ({ nestIndex, control }) => {
     const { register } = useForm();
    return (
        <div className="space-y-3">
            <Controller
                name={`${nestIndex}.src` as const}
                control={control}
                rules={{ required: "Изображение обязательно" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <>
                        <ImageDropzone label="Изображение" value={value} onChange={onChange} />
                        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                    </>
                )}
            />
            <TextField id={`${nestIndex}.alt`} label="Alt текст (для SEO)" register={register(`${nestIndex}.alt` as const)} className="text-sm !py-1.5" />
        </div>
    );
}

const ButtonBlockEditor: React.FC<{ nestIndex: string, control: any }> = ({ nestIndex, control }) => {
    const { register } = useForm();
    return (
        <div>
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Кнопка</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                <TextField id={`${nestIndex}.text`} label="Текст" register={register(`${nestIndex}.text` as const)} className="text-sm !py-1.5" />
                <TextField id={`${nestIndex}.link`} label="Ссылка (URL)" register={register(`${nestIndex}.link` as const)} className="text-sm !py-1.5" />
                <Controller
                    name={`${nestIndex}.variant` as const}
                    control={control}
                    render={({ field: controllerField }) => (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Стиль</label>
                            <select {...controllerField} className="w-full text-sm px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary">
                                <option value="contained">Основной</option>
                                <option value="outlined">Контурный</option>
                            </select>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

const ProductGridBlockEditor: React.FC<{ nestIndex: string, control: any }> = ({ nestIndex, control }) => {
    const { register } = useForm();
    return (
        <div>
           <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Сетка товаров</label>
           <div className="grid grid-cols-1 gap-2 mt-1">
               <TextField id={`${nestIndex}.title`} label="Заголовок блока" register={register(`${nestIndex}.title` as const)} className="text-sm !py-1.5" />
               <TextField id={`${nestIndex}.productIds`} label="ID товаров" register={register(`${nestIndex}.productIds` as any)} className="text-sm !py-1.5" helperText="Введите ID товаров через запятую (напр. 1, 5, 8)" />
           </div>
        </div>
    );
};

const CarouselBlockEditor: React.FC<{ nestIndex: string, control: any }> = ({ nestIndex, control }) => {
    const { fields, append, remove, move } = useFieldArray({ control, name: `${nestIndex}.images` as const });

    const addImage = () => append({ id: generateId(), src: '', alt: '' });

    return (
        <div className="space-y-3">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Карусель изображений</h3>
            {fields.map((imageField, imageIndex) => (
                <div key={imageField.id} className="p-3 border rounded-md dark:border-gray-600 bg-gray-100 dark:bg-gray-900/50 flex space-x-3 items-start">
                    <div className="flex flex-col items-center space-y-1">
                         <IconButton onClick={() => move(imageIndex, imageIndex - 1)} disabled={imageIndex === 0} className="!p-1" title="Переместить вверх"><span className="material-icons text-lg">arrow_upward</span></IconButton>
                         <IconButton onClick={() => move(imageIndex, imageIndex + 1)} disabled={imageIndex === fields.length - 1} className="!p-1" title="Переместить вниз"><span className="material-icons text-lg">arrow_downward</span></IconButton>
                         <IconButton onClick={() => remove(imageIndex)} className="!p-1 text-red-500" title="Удалить слайд"><span className="material-icons text-lg">delete</span></IconButton>
                    </div>
                    <div className="flex-grow">
                        <ImageBlockEditor nestIndex={`${nestIndex}.images.${imageIndex}`} control={control} />
                    </div>
                </div>
            ))}
            <Button type="button" variant="outlined" onClick={addImage}>Добавить слайд</Button>
        </div>
    );
};

const ColumnsBlockEditor: React.FC<{ nestIndex: string, control: any }> = ({ nestIndex, control }) => {
    const { fields: columnFields, update } = useFieldArray({ control, name: `${nestIndex}.columns` as const });
    const { watch } = useForm();
    const columnCount = watch(`${nestIndex}.columnCount` as const);
    
    return (
      <div>
        <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Секция с колонками</label>
        <div className={`mt-2 grid gap-4 grid-cols-1 sm:grid-cols-${columnCount}`}>
          {columnFields.map((column, colIndex) => (
            <div key={column.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/50 border dark:border-gray-700">
                <h4 className="font-semibold text-xs mb-2 text-gray-500">Колонка {colIndex + 1}</h4>
                <BlockList control={control} nestIndex={`${nestIndex}.columns.${colIndex}.blocks`} />
            </div>
          ))}
        </div>
      </div>
    );
};

const BlockRenderer: React.FC<{ block: PageBlock, nestIndex: string, control: any }> = ({ block, nestIndex, control }) => {
    switch(block.type) {
        case 'text': return <TextBlockEditor nestIndex={nestIndex} control={control} />;
        case 'image': return <ImageBlockEditor nestIndex={nestIndex} control={control} />;
        case 'button': return <ButtonBlockEditor nestIndex={nestIndex} control={control} />;
        case 'products': return <ProductGridBlockEditor nestIndex={nestIndex} control={control} />;
        case 'carousel': return <CarouselBlockEditor nestIndex={nestIndex} control={control} />;
        case 'columns': return <ColumnsBlockEditor nestIndex={nestIndex} control={control} />;
        default: return null;
    }
};

const BlockList: React.FC<{ control: any, nestIndex: string }> = ({ control, nestIndex }) => {
    const { fields, append, remove, move } = useFieldArray({ control, name: nestIndex });
    const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
    const columnsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
                setIsColumnsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const addBlock = (type: PageBlock['type'], options?: any) => {
        let newBlock: PageBlock;
        switch(type) {
            case 'image': newBlock = { id: generateId(), type, src: '', alt: 'Новое изображение' }; break;
            case 'button': newBlock = { id: generateId(), type, text: 'Нажми меня', link: '#', variant: 'contained' }; break;
            case 'products': newBlock = { id: generateId(), type, title: 'Рекомендуемые товары', productIds: [] }; break;
            case 'carousel': newBlock = { id: generateId(), type, images: [] }; break;
            case 'columns':
                const columnCount = options?.columnCount || 2;
                newBlock = {
                    id: generateId(), type, columnCount,
                    columns: Array.from({ length: columnCount }, () => ({ id: generateId(), blocks: [] }))
                };
                break;
            case 'text':
            default: newBlock = { id: generateId(), type: 'text', content: 'Новый текстовый блок.' }; break;
        }
        append(newBlock);
    };

    return (
        <div className="space-y-4">
            {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative group bg-white dark:bg-gray-800">
                     <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1 rounded-md shadow-md z-10">
                        <IconButton onClick={() => move(index, index - 1)} disabled={index === 0} className="!p-1" title="Переместить вверх"><span className="material-icons text-lg">arrow_upward</span></IconButton>
                        <IconButton onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} className="!p-1" title="Переместить вниз"><span className="material-icons text-lg">arrow_downward</span></IconButton>
                        <IconButton onClick={() => remove(index)} className="!p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Удалить блок"><span className="material-icons text-lg">delete</span></IconButton>
                    </div>
                    <BlockRenderer block={field as PageBlock} nestIndex={`${nestIndex}.${index}`} control={control} />
                </Card>
            ))}
             <Card className="p-2 mt-4">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <span className="text-sm font-medium">Добавить блок:</span>
                    <Button type="button" variant="outlined" onClick={() => addBlock('text')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">text_fields</span>Текст</Button>
                    <Button type="button" variant="outlined" onClick={() => addBlock('image')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">image</span>Изображение</Button>
                    <Button type="button" variant="outlined" onClick={() => addBlock('button')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">smart_button</span>Кнопка</Button>
                    <Button type="button" variant="outlined" onClick={() => addBlock('products')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">grid_view</span>Товары</Button>
                    <Button type="button" variant="outlined" onClick={() => addBlock('carousel')} className="!text-xs !py-1 !px-2"><span className="material-icons mr-1 text-sm">collections</span>Карусель</Button>
                    <div ref={columnsMenuRef} className="relative inline-block">
                        <Button type="button" variant="outlined" className="!text-xs !py-1 !px-2" onClick={() => setIsColumnsMenuOpen(prev => !prev)}>
                            <span className="material-icons mr-1 text-sm">view_column</span>Колонки
                        </Button>
                        {isColumnsMenuOpen && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex bg-white dark:bg-gray-700 shadow-lg rounded-md border dark:border-gray-600 p-1 space-x-1 z-20">
                                <Button type="button" variant="text" onClick={() => { addBlock('columns', { columnCount: 2 }); setIsColumnsMenuOpen(false); }} className="!text-xs !px-2">2</Button>
                                <Button type="button" variant="text" onClick={() => { addBlock('columns', { columnCount: 3 }); setIsColumnsMenuOpen(false); }} className="!text-xs !px-2">3</Button>
                                <Button type="button" variant="text" onClick={() => { addBlock('columns', { columnCount: 4 }); setIsColumnsMenuOpen(false); }} className="!text-xs !px-2">4</Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- Main Editor Component ---
const PageEditor: React.FC<PageEditorProps> = ({ page, onFinish }) => {
  const { updatePage } = useAppContext();
  const { control, handleSubmit, formState: { isSubmitting, isDirty }, reset, register } = useForm<FormData>({ defaultValues: page });

  useEffect(() => { reset(page); }, [page, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // Clean up productIds before submission
    const cleanContent = (blocks: PageBlock[]): PageBlock[] => {
        return blocks.map(block => {
            if (block.type === 'products') {
                // FIX: The form input provides productIds as a comma-separated string,
                // but the type is number[]. Cast to unknown to handle both cases.
                const rawIds: unknown = block.productIds;
                const productIdsAsArray = typeof rawIds === 'string'
                    ? rawIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
                    : (Array.isArray(rawIds) ? rawIds.map(Number).filter(id => !isNaN(id)) : []);
                return { ...block, productIds: productIdsAsArray };
            }
            if (block.type === 'columns') {
                return { ...block, columns: block.columns.map(col => ({ ...col, blocks: cleanContent(col.blocks) }))};
            }
            return block;
        });
    };
    
    const finalData = { ...data, content: cleanContent(data.content) };
    await updatePage(page.id, finalData);
    onFinish();
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg p-3 flex justify-end items-center space-x-4 z-50">
          <h3 className="text-lg font-semibold mr-auto pl-2">Режим редактирования</h3>
          <Button type="button" variant="text" onClick={onFinish} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
      </div>

      <div className="pb-24">
          <Card className="p-6 md:p-8 mb-6">
              <div className="space-y-4">
                  <TextField id="title" label="Заголовок страницы" register={register('title', { required: 'Введите заголовок' })} />
                  <TextField id="slug" label="Slug (URL)" register={register('slug', { required: 'Введите slug' })} disabled helperText="Slug нельзя изменить после создания страницы." />
              </div>
          </Card>
          <BlockList control={control} nestIndex="content" />
      </div>
    </form>
  );
};

export default PageEditor;
import React, { useState } from 'react';
import { Product } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';

declare var XLSX: any;

interface ImportProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ParsedProduct = Omit<Product, 'id'>;

const CSV_TEMPLATE_HEADERS = 'Наименование,Артикул,Производитель,Поставщик,Ячейка,Цена,Количество,Закупка,Ссылка на фото,Категория,Дата поступления,Описание,Аналоги\n';
const CSV_TEMPLATE_EXAMPLE = 'Тормозные колодки,BP-CER-001,Brembo,Основной поставщик,A-12-03,4500,50,2800,https://example.com/image.jpg,Тормозная система,2023-10-15,"Керамические колодки","TRW-123;ATE-456"\n';


const ImportProductsDialog: React.FC<ImportProductsDialogProps> = ({ isOpen, onClose }) => {
    const { batchUpdateProducts, showSnackbar, addImportLog, categories } = useAppContext();
    const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setParsedData([]);
        setFileName('');
        setIsProcessing(false);
        setError(null);
        onClose();
    };
    
    const setAndLogError = (message: string, currentFileName: string) => {
        setError(message);
        addImportLog({
            fileName: currentFileName,
            status: 'error',
            message: message,
        });
    };

    const processData = (headers: string[], rows: any[][]) => {
        const headerMap: { [key: string]: keyof Omit<ParsedProduct, 'inStock'> } = {
            'Наименование': 'name',
            'Артикул': 'sku',
            'Производитель': 'brand',
            'Поставщик': 'supplier',
            'Ячейка': 'storageBin',
            'Цена': 'price',
            'Цена продажи': 'price',
            'Количество': 'stockQuantity',
            'Закупка': 'purchasePrice',
            'Цена закупки': 'purchasePrice',
            'Ссылка на фото': 'imageUrl',
            'ID Категории': 'categoryId',
            'Категория': 'categoryId',
            'Дата поступления': 'arrivalDate',
            'Описание': 'description',
            'Аналоги': 'analogs',
        };

        const requiredDbHeaders: (keyof Omit<ParsedProduct, 'inStock'>)[] = ['sku', 'name'];
        const headerKeys = headers.map(h => headerMap[h.trim()]).filter(Boolean);

        for (const rh of requiredDbHeaders) {
            if (!headerKeys.includes(rh)) {
                throw new Error(`Отсутствует обязательный столбец для поля: ${rh}`);
            }
        }

        const data: ParsedProduct[] = rows.map((rowValues, index) => {
            const entry: any = { analogs: [], categoryId: '', description: '', imageUrl: '', stockQuantity: 0, price: 0, purchasePrice: 0, supplier: '', storageBin: '', arrivalDate: undefined };
            headers.forEach((header, i) => {
                const key = headerMap[header.trim()];
                if (key) {
                    entry[key] = rowValues[i];
                }
            });

            if (!entry.sku) {
                throw new Error(`Строка ${index + 2}: Артикул (sku) является обязательным полем.`);
            }

            let finalCategoryId = '';
            const categoryIdentifier = entry.categoryId ? String(entry.categoryId).trim() : '';

            if (categoryIdentifier) {
                const foundCategory = categories.find(c => 
                    c.id.toLowerCase() === categoryIdentifier.toLowerCase() || 
                    c.name.toLowerCase() === categoryIdentifier.toLowerCase()
                );
                if (foundCategory) {
                    finalCategoryId = foundCategory.id;
                } else {
                    console.warn(`Строка ${index + 2}: Категория "${categoryIdentifier}" не найдена. Товар будет импортирован без категории.`);
                }
            }

            let arrivalDateISO: string | undefined = undefined;
            if (entry.arrivalDate) {
                const dateValue = typeof entry.arrivalDate === 'number'
                    ? new Date(Date.UTC(0, 0, entry.arrivalDate - 1))
                    : new Date(entry.arrivalDate);
                
                if (!isNaN(dateValue.getTime())) {
                    arrivalDateISO = dateValue.toISOString();
                }
            }


            const stockQuantity = parseInt(entry.stockQuantity, 10) || 0;
            return {
                name: String(entry.name || ''),
                categoryId: finalCategoryId,
                price: parseFloat(String(entry.price || '0').replace(',', '.')) || 0,
                purchasePrice: parseFloat(String(entry.purchasePrice || '0').replace(',', '.')) || 0,
                imageUrl: String(entry.imageUrl || ''),
                description: String(entry.description || ''),
                sku: String(entry.sku),
                brand: String(entry.brand || ''),
                stockQuantity: stockQuantity,
                inStock: stockQuantity > 0,
                analogs: entry.analogs ? String(entry.analogs).split(';').map((s: string) => s.trim()).filter(Boolean) : [],
                supplier: String(entry.supplier || ''),
                storageBin: String(entry.storageBin || ''),
                arrivalDate: arrivalDateISO,
            };
        });
        setParsedData(data);
    };

    const parseFile = (file: File) => {
        setIsProcessing(true);
        setError(null);
        setFileName(file.name);
        setParsedData([]);

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                if (file.name.endsWith('.csv')) {
                    const text = e.target?.result as string;
                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                    if (lines.length < 2) throw new Error("CSV-файл пуст или содержит только заголовок.");
                    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                    const rows = lines.slice(1).map(line => line.split(',').map(v => v.trim().replace(/^"|"$/g, '')));
                    processData(headers, rows);
                } else { // xlsx, xls
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                    if (json.length < 2) throw new Error("Файл пуст или содержит только заголовок.");
                    const headers = json[0].map(h => String(h).trim());
                    const rows = json.slice(1);
                    processData(headers, rows);
                }
            } catch (err) {
                 const errorMessage = err instanceof Error ? `Ошибка парсинга: ${err.message}` : 'Неизвестная ошибка при чтении файла.';
                 setAndLogError(errorMessage, file.name);
            } finally {
                setIsProcessing(false);
            }
        };
        
        reader.onerror = () => {
            const errorMessage = "Не удалось прочитать файл.";
            setAndLogError(errorMessage, file.name);
            setIsProcessing(false);
        };

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(file);
        }
    }
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            setError('Неподдерживаемый формат файла. Пожалуйста, используйте .csv или .xlsx');
            return;
        }

        parseFile(file);
        event.target.value = ''; // Reset input to allow re-uploading the same file
    };
    
    const handleDownloadTemplate = () => {
         const blob = new Blob([`\uFEFF${CSV_TEMPLATE_HEADERS}${CSV_TEMPLATE_EXAMPLE}`], { type: 'text/csv;charset=utf-8;' });
         const link = document.createElement("a");
         const url = URL.createObjectURL(blob);
         link.setAttribute("href", url);
         link.setAttribute("download", "warehouse_template.csv");
         link.style.visibility = 'hidden';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) {
            showSnackbar('Нет данных для импорта.', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            await batchUpdateProducts(parsedData);
            await addImportLog({
                fileName,
                status: 'success',
                message: `Импортировано/обновлено ${parsedData.length} товаров.`
            });
            handleClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? `Ошибка импорта: ${err.message}` : 'Неизвестная ошибка при импорте.';
            setAndLogError(errorMessage, fileName);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Импорт товаров из CSV или Excel" className="max-w-3xl">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Загрузите файл в формате CSV (UTF-8) или Excel (.xlsx).
                    Артикул (sku) используется для поиска существующих товаров. Если товар с таким артикулом найден, он будет обновлен. В противном случае, будет создан новый.
                </p>
                 <div>
                    <Button onClick={handleDownloadTemplate} variant="text">
                        <span className="material-icons mr-2 text-base">download</span>
                        Скачать шаблон (CSV)
                    </Button>
                </div>
                <div>
                     <label htmlFor="file-upload" className="cursor-pointer inline-block bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <span>{fileName || 'Выберите файл...'}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
                    </label>
                </div>

                {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-md">{error}</p>}
                
                {parsedData.length > 0 && (
                    <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left font-medium">Название</th>
                                    <th className="p-2 text-left font-medium">Артикул</th>
                                    <th className="p-2 text-left font-medium">Цена</th>
                                    <th className="p-2 text-left font-medium">Кол-во</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {parsedData.slice(0, 10).map((p, i) => (
                                    <tr key={i} className="bg-white dark:bg-gray-800">
                                        <td className="p-2 truncate" title={p.name}>{p.name}</td>
                                        <td className="p-2">{p.sku}</td>
                                        <td className="p-2">{p.price}</td>
                                        <td className="p-2">{p.stockQuantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 10 && <p className="text-center text-xs p-2 bg-gray-50 dark:bg-gray-700">и еще {parsedData.length - 10}...</p>}
                    </div>
                )}
                 <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Найдено для импорта: {parsedData.length} товаров</p>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="text" onClick={handleClose} disabled={isProcessing}>Отмена</Button>
                    <Button type="button" onClick={handleImport} disabled={isProcessing || parsedData.length === 0 || !!error}>
                        {isProcessing ? 'Обработка...' : 'Импортировать'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default ImportProductsDialog;
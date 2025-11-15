import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { SiteSettings as SiteSettingsType, HomepageBlock } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';
import TextField from '../ui/TextField';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import ManageNews from './ManageNews';
import ManagePages from './ManagePages';

// --- Reusable Components ---

const SettingsCard: React.FC<{ icon: string; title: string; description: string; onClick: () => void; }> = ({ icon, title, description, onClick }) => (
    <Card 
        role="button"
        className="p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:scale-105"
        onClick={onClick}
    >
        <div className="flex justify-center items-center mx-auto w-16 h-16 bg-primary/10 rounded-full mb-4">
            <span className="material-icons text-4xl text-primary">{icon}</span>
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </Card>
);

const SettingsSectionWrapper: React.FC<{ title: string; onBack: () => void; children: React.ReactNode; }> = ({ title, onBack, children }) => (
    <div>
        <div className="flex items-center mb-4">
            <IconButton onClick={onBack} className="mr-2">
                <span className="material-icons">arrow_back</span>
            </IconButton>
            <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {children}
    </div>
);


// --- Specific Settings Components ---

const GeneralSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { siteSettings, updateSiteSettings } = useAppContext();
    const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset, setValue, watch } = useForm<SiteSettingsType>();
    const logoUrlValue = watch('logoUrl');

    useEffect(() => {
        if (siteSettings) reset(siteSettings);
    }, [siteSettings, reset]);

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue('logoUrl', reader.result as string, { shouldValidate: true, shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const onSubmit: SubmitHandler<Partial<SiteSettingsType>> = async (data) => {
        if (!siteSettings) return;
        const updatedSettings = { ...siteSettings, ...data };
        await updateSiteSettings(updatedSettings);
        reset(updatedSettings);
    };

    return (
        <SettingsSectionWrapper title="Общие настройки" onBack={onBack}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="p-6 space-y-4">
                    <TextField id="siteName" label="Название сайта" register={register('siteName', { required: 'Введите название сайта' })} error={errors.siteName as any} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Логотип</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-1 shrink-0">
                                {logoUrlValue ? (
                                    <img src={logoUrlValue} alt="Предпросмотр логотипа" className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <span className="material-icons text-gray-400 text-3xl">photo_size_select_actual</span>
                                )}
                            </div>
                            <label htmlFor="logo-upload" className="cursor-pointer bg-white dark:bg-gray-800 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <span>Загрузить файл</span>
                                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoFileChange} />
                            </label>
                        </div>
                    </div>
                </Card>
                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </form>
        </SettingsSectionWrapper>
    );
};

const SEOSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { siteSettings, updateSiteSettings } = useAppContext();
    const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset } = useForm<SiteSettingsType>();
    
    useEffect(() => { if (siteSettings) reset(siteSettings); }, [siteSettings, reset]);

    const onSubmit: SubmitHandler<Partial<SiteSettingsType>> = async (data) => {
        if (!siteSettings) return;
        const updatedSettings = { ...siteSettings, ...data };
        await updateSiteSettings(updatedSettings);
        reset(updatedSettings);
    };

    return (
        <SettingsSectionWrapper title="SEO" onBack={onBack}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="p-6 space-y-4">
                    <TextField id="seoTitle" label="SEO Заголовок" register={register('seoTitle')} error={errors.seoTitle as any} />
                    <TextField id="seoDescription" label="SEO Описание" register={register('seoDescription')} error={errors.seoDescription as any} />
                    <TextField id="seoKeywords" label="SEO Ключевые слова (через запятую)" register={register('seoKeywords')} error={errors.seoKeywords as any} />
                </Card>
                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </form>
        </SettingsSectionWrapper>
    );
};

const ContactSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { siteSettings, updateSiteSettings } = useAppContext();
    const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset } = useForm<SiteSettingsType>();
    
    useEffect(() => { if (siteSettings) reset(siteSettings); }, [siteSettings, reset]);

    const onSubmit: SubmitHandler<Partial<SiteSettingsType>> = async (data) => {
        if (!siteSettings) return;
        const updatedSettings = { ...siteSettings, ...data };
        await updateSiteSettings(updatedSettings);
        reset(updatedSettings);
    };

    return (
        <SettingsSectionWrapper title="Контактная информация" onBack={onBack}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="p-6 space-y-4">
                    <TextField id="contactPhone" label="Телефон" register={register('contactPhone')} error={errors.contactPhone as any} />
                    <TextField id="contactEmail" label="Email" register={register('contactEmail')} error={errors.contactEmail as any} />
                    <TextField id="contactAddress" label="Адрес" register={register('contactAddress')} error={errors.contactAddress as any} />
                </Card>
                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </form>
        </SettingsSectionWrapper>
    );
};

const BannerSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { siteSettings, updateSiteSettings } = useAppContext();
    const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset, control, setValue } = useForm<SiteSettingsType>();
    
    const { fields, append, remove } = useFieldArray({ control, name: "promoBanners" });
    
    useEffect(() => { if (siteSettings) reset(siteSettings); }, [siteSettings, reset]);

    const handleBannerFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue(`promoBanners.${index}.imageUrl`, reader.result as string, { shouldValidate: true, shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const addNewBanner = () => append({ id: `new_${Date.now()}`, imageUrl: '', linkUrl: '#', enabled: true, });

    const onSubmit: SubmitHandler<SiteSettingsType> = async (data) => {
        const submissionData = { ...siteSettings, ...data, promoBannerSpeed: Number(data.promoBannerSpeed), promoBannerHeight: Number(data.promoBannerHeight) };
        await updateSiteSettings(submissionData);
        reset(submissionData);
    };

    return (
        <SettingsSectionWrapper title="Рекламный баннер" onBack={onBack}>
            <form onSubmit={handleSubmit(onSubmit)}>
                 <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextField id="promoBannerSpeed" label="Скорость смены (секунды)" type="number" register={register('promoBannerSpeed', { required: true, min: 1 })} error={errors.promoBannerSpeed as any} />
                        <TextField id="promoBannerHeight" label="Высота (в пикселях)" type="number" register={register('promoBannerHeight', { required: 'Укажите высоту', min: { value: 100, message: 'Минимум 100px' }, max: { value: 800, message: 'Максимум 800px' }, valueAsNumber: true })} error={errors.promoBannerHeight as any} helperText="Рекомендуемая высота: 250-450px" />
                    </div>
                    
                    <div className="mt-6 pt-6 border-t dark:border-gray-700">
                        <h3 className="text-md font-semibold">Слайды баннера</h3>
                        <div className="space-y-4 mt-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-3 border rounded-md dark:border-gray-600 relative bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex flex-col space-y-2 shrink-0">
                                            <div className="w-48 h-24 rounded-md bg-gray-200 dark:bg-gray-700 bg-cover bg-center" style={{ backgroundImage: `url(${field.imageUrl || ''})` }} role="img">
                                                {!field.imageUrl && <span className="material-icons text-gray-400 flex items-center justify-center h-full">photo_size_select_actual</span>}
                                            </div>
                                            <label htmlFor={`promoBanners.${index}.imageUpload`} className="cursor-pointer text-center bg-white dark:bg-gray-800 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <span>Загрузить</span>
                                                <input id={`promoBanners.${index}.imageUpload`} type="file" className="sr-only" accept="image/*" onChange={(e) => handleBannerFileChange(index, e)} />
                                            </label>
                                        </div>
                                        <div className="flex-grow space-y-3">
                                            <TextField id={`promoBanners.${index}.linkUrl`} label="Ссылка (URL)" register={register(`promoBanners.${index}.linkUrl`)} error={errors.promoBanners?.[index]?.linkUrl as any} className="!py-1.5 text-sm" />
                                            <label className="flex items-center cursor-pointer pt-2">
                                                <input type="checkbox" {...register(`promoBanners.${index}.enabled`)} className="h-4 w-4 rounded border-gray-300 text-primary" />
                                                <span className="ml-2 text-sm">Включен</span>
                                            </label>
                                        </div>
                                    </div>
                                    <IconButton onClick={() => remove(index)} className="!absolute top-1 right-1 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30">
                                        <span className="material-icons text-lg">delete</span>
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outlined" onClick={addNewBanner} className="mt-4">
                            <span className="material-icons mr-2 -ml-1 text-base">add</span>
                            Добавить баннер
                        </Button>
                    </div>
                </Card>
                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                         {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </form>
        </SettingsSectionWrapper>
    );
};

const HomepageSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { homepageBlocks, updateHomepageBlocks } = useAppContext();
    const [blocks, setBlocks] = useState<HomepageBlock[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setBlocks(homepageBlocks);
    }, [homepageBlocks]);

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const toggleEnabled = (id: HomepageBlock['id']) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
    }

    const handleSave = async () => {
        setIsSaving(true);
        await updateHomepageBlocks(blocks);
        setIsSaving(false);
    }
    
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(homepageBlocks);
    
    const blockIcons: Record<HomepageBlock['id'], string> = {
        categories: 'category',
        featured: 'star',
        news: 'article',
        promo_banner: 'view_carousel',
        search: 'search',
    };

    return (
        <SettingsSectionWrapper title="Редактор главной страницы" onBack={onBack}>
            <p className="text-sm text-gray-500 mb-4">Измените порядок или отключите блоки на главной странице.</p>
             <Card className="p-4">
                <div className="space-y-2">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex items-center">
                                <span className={`material-icons mr-3 ${block.enabled ? 'text-green-500' : 'text-gray-400'}`}>
                                    {blockIcons[block.id] || 'drag_indicator'}
                                </span>
                                <span className={!block.enabled ? 'line-through text-gray-500' : ''}>{block.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={block.enabled} onChange={() => toggleEnabled(block.id)} className="h-4 w-4 rounded text-primary" />
                                    <span className="ml-2 text-sm">Вкл</span>
                                </label>
                                <IconButton onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                                    <span className="material-icons">arrow_upward</span>
                                </IconButton>
                                <IconButton onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}>
                                    <span className="material-icons">arrow_downward</span>
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <div className="flex justify-end mt-4">
                <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </SettingsSectionWrapper>
    );
};

const NewsSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <SettingsSectionWrapper title="Управление новостями" onBack={onBack}>
        <ManageNews />
    </SettingsSectionWrapper>
);

const PagesSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <SettingsSectionWrapper title="Управление страницами" onBack={onBack}>
        <ManagePages />
    </SettingsSectionWrapper>
);


// --- Main SiteSettings Component ---

const SiteSettings: React.FC = () => {
    type View = 'main' | 'general' | 'seo' | 'contacts' | 'banner' | 'homepage' | 'news' | 'pages';
    const [currentView, setCurrentView] = useState<View>('main');

    const goBack = () => setCurrentView('main');

    if (currentView === 'general') return <GeneralSettings onBack={goBack} />;
    if (currentView === 'seo') return <SEOSettings onBack={goBack} />;
    if (currentView === 'contacts') return <ContactSettings onBack={goBack} />;
    if (currentView === 'banner') return <BannerSettings onBack={goBack} />;
    if (currentView === 'homepage') return <HomepageSettings onBack={goBack} />;
    if (currentView === 'news') return <NewsSettings onBack={goBack} />;
    if (currentView === 'pages') return <PagesSettings onBack={goBack} />;

    // Default to 'main' view
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Настройки сайта</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <SettingsCard 
                    icon="tune"
                    title="Общие настройки"
                    description="Название сайта и логотип."
                    onClick={() => setCurrentView('general')}
                />
                <SettingsCard 
                    icon="trending_up"
                    title="SEO"
                    description="Настройки для поисковой оптимизации."
                    onClick={() => setCurrentView('seo')}
                />
                <SettingsCard 
                    icon="contacts"
                    title="Контактная информация"
                    description="Телефон, email и адрес в подвале."
                    onClick={() => setCurrentView('contacts')}
                />
                <SettingsCard 
                    icon="view_carousel"
                    title="Рекламный баннер"
                    description="Управление слайдами на главной."
                    onClick={() => setCurrentView('banner')}
                />
                <SettingsCard 
                    icon="view_quilt"
                    title="Главная страница"
                    description="Настройте порядок и видимость блоков."
                    onClick={() => setCurrentView('homepage')}
                />
                 <SettingsCard 
                    icon="article"
                    title="Новости"
                    description="Управление новостями и акциями."
                    onClick={() => setCurrentView('news')}
                />
                <SettingsCard 
                    icon="description"
                    title="Страницы"
                    description="Редактирование статических страниц."
                    onClick={() => setCurrentView('pages')}
                />
            </div>
        </div>
    );
};

export default SiteSettings;
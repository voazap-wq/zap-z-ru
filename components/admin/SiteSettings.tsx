import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { SiteSettings as SiteSettingsType } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';
import TextField from '../ui/TextField';
import Button from '../ui/Button';

const SiteSettings: React.FC = () => {
    const { siteSettings, updateSiteSettings } = useAppContext();
    const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset } = useForm<SiteSettingsType>();

    useEffect(() => {
        if (siteSettings) {
            reset(siteSettings);
        }
    }, [siteSettings, reset]);

    const onSubmit: SubmitHandler<SiteSettingsType> = async (data) => {
        await updateSiteSettings(data);
        reset(data);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Настройки сайта</h1>
            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-4">
                        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
                        <TextField id="siteName" label="Название сайта" register={register('siteName', { required: true })} error={errors.siteName as any} />
                        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
                        <TextField id="logoUrl" label="URL логотипа" register={register('logoUrl')} error={errors.logoUrl as any} />
                        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
                        <TextField id="seoTitle" label="SEO Заголовок" register={register('seoTitle')} error={errors.seoTitle as any} />
                        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
                        <TextField id="seoDescription" label="SEO Описание" register={register('seoDescription')} error={errors.seoDescription as any} />
                        <TextField id="seoKeywords" label="SEO Ключевые слова (через запятую)" register={register('seoKeywords')} error={errors.seoKeywords as any} />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !isDirty}>
                            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default SiteSettings;

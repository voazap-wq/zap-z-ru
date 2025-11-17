import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';

const ContactsPage: React.FC = () => {
    const { siteSettings } = useAppContext();

    if (!siteSettings) {
        return <div>Загрузка информации о контактах...</div>;
    }

    const { 
        contactAddress, 
        contactPhone, 
        contactEmail, 
        contactWhatsapp,
        contactTelegram,
        contactMapIframe, 
        companyName, 
        ogrn, 
        inn 
    } = siteSettings;

    const formatWhatsappLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '')}`;
    const formatTelegramLink = (username: string) => `https://t.me/${username.replace('@', '')}`;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-center">Контакты</h1>
            <Card className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="prose dark:prose-invert max-w-none space-y-2">
                        <h3><strong>Наши контакты</strong></h3>
                        {contactAddress && <p><strong>Адрес:</strong> {contactAddress}</p>}
                        {contactPhone && <p><strong>Телефон:</strong> {contactPhone}</p>}
                        {contactEmail && <p><strong>Email:</strong> {contactEmail}</p>}
                        
                        {contactWhatsapp && (
                            <div className="flex items-center gap-x-2 not-prose">
                                <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WhatsApp" className="w-6 h-6" />
                                <strong className="font-semibold">WhatsApp:</strong>
                                <a href={formatWhatsappLink(contactWhatsapp)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {contactWhatsapp}
                                </a>
                            </div>
                        )}
                        {contactTelegram && (
                             <div className="flex items-center gap-x-2 not-prose">
                                <img src="https://img.icons8.com/color/48/telegram-app--v1.png" alt="Telegram" className="w-6 h-6" />
                                <strong className="font-semibold">Telegram:</strong>
                                <a href={formatTelegramLink(contactTelegram)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    @{contactTelegram.replace('@', '')}
                                </a>
                            </div>
                        )}
                        
                        <h3 className="!mt-8"><strong>Реквизиты</strong></h3>
                        {companyName && <p className="!my-1">{companyName}</p>}
                        {ogrn && <p className="!my-1"><strong>ОГРН:</strong> {ogrn}</p>}
                        {inn && <p className="!my-1"><strong>ИНН:</strong> {inn}</p>}
                    </div>
                    {contactMapIframe && <div dangerouslySetInnerHTML={{ __html: contactMapIframe }} />}
                </div>
            </Card>
        </div>
    );
};

export default ContactsPage;
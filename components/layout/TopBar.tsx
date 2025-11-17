import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

const TopBar: React.FC = () => {
  const { siteSettings } = useAppContext();
  
  if (!siteSettings) return null;

  const { contactPhone, contactEmail, contactWhatsapp, contactTelegram } = siteSettings;

  const hasContacts = contactPhone || contactEmail;
  const hasSocials = contactWhatsapp || contactTelegram;
  
  if (!hasContacts && !hasSocials) {
    return null;
  }

  const formatWhatsappLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '')}`;
  const formatTelegramLink = (username: string) => `https://t.me/${username.replace('@', '')}`;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left Side: Phone & Email */}
        <div className="flex items-center space-x-6">
          {contactPhone && (
            <a href={`tel:${contactPhone.replace(/\D/g, '')}`} className="flex items-center hover:text-primary transition-colors">
              <span className="material-icons text-base mr-1.5">call</span>
              <span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center hover:text-primary transition-colors hidden sm:flex">
              <span className="material-icons text-base mr-1.5">email</span>
              <span>{contactEmail}</span>
            </a>
          )}
        </div>

        {/* Right Side: Socials */}
        {hasSocials && (
            <div className="flex items-center space-x-4">
            {contactWhatsapp && (
                <a 
                    href={formatWhatsappLink(contactWhatsapp)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center transition-opacity hover:opacity-80"
                    title="Написать в WhatsApp"
                >
                    <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WhatsApp" className="w-6 h-6" />
                </a>
            )}
            {contactTelegram && (
                <a 
                    href={formatTelegramLink(contactTelegram)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center transition-opacity hover:opacity-80"
                    title="Написать в Telegram"
                >
                    <img src="https://img.icons8.com/color/48/telegram-app--v1.png" alt="Telegram" className="w-6 h-6" />
                </a>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
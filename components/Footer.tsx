
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
// Fix: Use relative paths for local module imports.
import { UmbrellaIcon } from './Icons';

const Footer: React.FC = () => {
  const { t } = useLocalization();
  
  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center gap-2 text-2xl font-serif font-bold">
              <UmbrellaIcon className="h-6 w-6 text-brand-gold" />
              Jewelry Umbrella
            </div>
            <p className="mt-4 text-brand-light/70 max-w-xs text-center md:text-left">{t('heroSubtitle')}</p>
          </div>
          <div className="text-center">
            <h3 className="font-serif text-xl font-semibold tracking-wider text-brand-gold">{t('socialMedia')}</h3>
            <div className="mt-4 flex justify-center space-x-6 rtl:space-x-reverse">
              <a href="#" className="text-brand-light/70 hover:text-white">Facebook</a>
              <a href="#" className="text-brand-light/70 hover:text-white">Instagram</a>
              <a href="#" className="text-brand-light/70 hover:text-white">Twitter</a>
            </div>
          </div>
          <div className="text-center md:text-right md:rtl:text-left">
            <h3 className="font-serif text-xl font-semibold tracking-wider text-brand-gold">Links</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-brand-light/70 hover:text-white">{t('aboutUs')}</a></li>
              <li><a href="#" className="text-brand-light/70 hover:text-white">{t('contact')}</a></li>
              <li><a href="#" className="text-brand-light/70 hover:text-white">{t('faq')}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-brand-gray pt-8">
          <p className="text-center text-brand-light/70 text-sm">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
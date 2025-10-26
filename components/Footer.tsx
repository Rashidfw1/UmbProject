import React, { useContext } from 'react';
import { useLocalization } from '../hooks/useLocalization';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { InstagramIcon, SnapchatIcon, TwitterIcon } from './Icons';

const Footer: React.FC = () => {
  const { t, getLocalized } = useLocalization();
  const context = useContext(AppContext);
  if (!context || !context.logoUrl || !context.homepageContent || !context.socialMediaLinks) return null;
  const { logoUrl, homepageContent, socialMediaLinks } = context;
  
  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="flex flex-col items-center md:items-start">
             <img src={logoUrl} alt="Jewelry Umbrella Logo" className="h-10 w-auto brightness-0 invert" />
            <p className="mt-4 text-brand-light/70 max-w-xs text-center md:text-left">{getLocalized(homepageContent.heroSubtitle)}</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-serif text-xl font-semibold tracking-wider text-brand-gold">Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-brand-light/70 hover:text-white">{t('aboutUs')}</Link></li>
              <li><a href="#" className="text-brand-light/70 hover:text-white">{t('contact')}</a></li>
              <li><Link to="/faq" className="text-brand-light/70 hover:text-white">{t('faq')}</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-serif text-xl font-semibold tracking-wider text-brand-gold">{t('socialMedia')}</h3>
            <div className="mt-4 flex justify-center md:justify-start space-x-6 rtl:space-x-reverse">
              {socialMediaLinks.instagram && (
                <a href={socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-brand-light/70 hover:text-white">
                  <InstagramIcon className="w-6 h-6" />
                </a>
              )}
              {socialMediaLinks.snapchat && (
                <a href={socialMediaLinks.snapchat} target="_blank" rel="noopener noreferrer" className="text-brand-light/70 hover:text-white">
                  <SnapchatIcon className="w-6 h-6" />
                </a>
              )}
               {socialMediaLinks.twitter && (
                <a href={socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-brand-light/70 hover:text-white">
                  <TwitterIcon className="w-6 h-6" />
                </a>
              )}
            </div>
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
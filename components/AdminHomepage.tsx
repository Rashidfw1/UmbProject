import React, { useContext, useCallback, useState, ChangeEvent, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { UploadCloudIcon } from './Icons';
import { HomepageContent } from '../types';

const AdminHomepage: React.FC = () => {
    const context = useContext(AppContext);
    const { t, language } = useLocalization();
    const [preview, setPreview] = useState<string | null>(null);
    const [saveError, setSaveError] = useState('');

    if (!context) return null;
    const { homepageContent, updateHomepageContent } = context;
    
    const [formContent, setFormContent] = useState<HomepageContent | null>(homepageContent);
    
    useEffect(() => {
        setFormContent(homepageContent);
    }, [homepageContent]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const resultStr = reader.result as string;
                setPreview(resultStr);
                setFormContent(prev => prev ? { ...prev, heroImageUrl: resultStr } : null);
                setSaveError('');
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false
    });

    const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formContent) return;
        const { name, value } = e.target;
        const [field, lang] = name.split('.');
        setFormContent(prev => ({
            ...prev!,
            [field]: {
                ...(prev![field as keyof HomepageContent] as object),
                [lang]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaveError('');
        if(formContent) {
            try {
                await updateHomepageContent(formContent);
                alert('Homepage content updated successfully!');
                setPreview(null); // Clear preview after successful save
            } catch (e: any) {
                setSaveError(e.message);
                alert('Failed to save homepage content: ' + e.message);
            }
        }
    };
    
    if (!formContent) {
        return <div>Loading...</div>;
    }
    
    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                 <h2 className="text-2xl font-semibold text-brand-dark">{t('homepageContentManagement')}</h2>
                 <button onClick={handleSave} className="px-6 py-2 bg-brand-gold text-white rounded-md text-sm font-semibold w-full sm:w-auto">{t('save')}</button>
            </div>
            {saveError && <p className="text-red-500 bg-red-50 p-3 rounded-md text-sm mb-4">{saveError}</p>}
            
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Side */}
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                        {/* Image Management */}
                        <div>
                            <h3 className="text-lg font-semibold text-brand-dark mb-4">{t('heroImage')}</h3>
                             <p className="text-sm font-medium text-gray-700 mb-2">{t('uploadNewImage')}</p>
                             <div {...getRootProps()} className={`flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-brand-gold bg-brand-light/30' : 'hover:border-brand-gold/50'}`}>
                                <div className="space-y-1 text-center">
                                    <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                    <div className="flex text-sm text-gray-600">
                                        <p className="relative bg-white rounded-md font-medium text-brand-gold hover:text-brand-dark focus-within:outline-none">
                                            <span>{t('dragAndDropOrClick')}</span>
                                            <input {...getInputProps()} className="sr-only" />
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">{t('imageFileTypes')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Text Content Management */}
                        <div className="border-t pt-4 mt-6">
                            <h3 className="text-lg font-semibold text-brand-dark mb-4">{t('homepageTextContentManagement')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hero Title (English)</label>
                                    <input type="text" name="heroTitle.en" value={formContent.heroTitle.en} onChange={handleTextChange} className="mt-1 block w-full input"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Hero Title (Arabic)</label>
                                    <input type="text" name="heroTitle.ar" value={formContent.heroTitle.ar} onChange={handleTextChange} className="mt-1 block w-full input" dir="rtl"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Hero Subtitle (English)</label>
                                    <textarea name="heroSubtitle.en" value={formContent.heroSubtitle.en} onChange={handleTextChange} rows={3} className="mt-1 block w-full input"></textarea>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Hero Subtitle (Arabic)</label>
                                    <textarea name="heroSubtitle.ar" value={formContent.heroSubtitle.ar} onChange={handleTextChange} rows={3} className="mt-1 block w-full input" dir="rtl"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">"Shop Now" Button (English)</label>
                                    <input type="text" name="shopNowButton.en" value={formContent.shopNowButton.en} onChange={handleTextChange} className="mt-1 block w-full input"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">"Shop Now" Button (Arabic)</label>
                                    <input type="text" name="shopNowButton.ar" value={formContent.shopNowButton.ar} onChange={handleTextChange} className="mt-1 block w-full input" dir="rtl"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">"Featured Products" Title (English)</label>
                                    <input type="text" name="featuredProductsTitle.en" value={formContent.featuredProductsTitle.en} onChange={handleTextChange} className="mt-1 block w-full input"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">"Featured Products" Title (Arabic)</label>
                                    <input type="text" name="featuredProductsTitle.ar" value={formContent.featuredProductsTitle.ar} onChange={handleTextChange} className="mt-1 block w-full input" dir="rtl"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Side */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold mb-2 text-center text-gray-600">Live Preview ({language.toUpperCase()})</h4>
                        <div className="relative h-56 flex items-center justify-center text-white text-center bg-gray-500 rounded-lg overflow-hidden">
                            <img src={preview || formContent.heroImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="preview"/>
                            <div className="relative p-2">
                                <h1 className="text-2xl font-serif font-bold">{formContent.heroTitle[language]}</h1>
                                <p className="mt-2 text-sm max-w-sm mx-auto">{formContent.heroSubtitle[language]}</p>
                                <button className="mt-4 px-5 py-2 bg-brand-gold text-white text-xs font-semibold rounded-full">{formContent.shopNowButton[language]}</button>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <h2 className="text-xl font-serif font-bold text-brand-dark">{formContent.featuredProductsTitle[language]}</h2>
                             <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="h-20 bg-gray-200 rounded-md animate-pulse"></div>
                                <div className="h-20 bg-gray-200 rounded-md animate-pulse delay-75"></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`.input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
        </div>
    );
};

export default AdminHomepage;
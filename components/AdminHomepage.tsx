import React, { useContext, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { UploadCloudIcon } from './Icons';

const AdminHomepage: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();
    const [preview, setPreview] = useState<string | null>(null);

    if (!context) return null;
    const { homepageContent, updateHomepageContent } = context;

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const resultStr = reader.result as string;
                setPreview(resultStr);
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

    const handleSave = () => {
        if (preview) {
            updateHomepageContent({ ...homepageContent, heroImageUrl: preview });
            alert('Homepage hero image updated successfully!');
            setPreview(null);
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-semibold text-brand-dark mb-6">{t('homepageContentManagement')}</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">{t('heroImage')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{t('currentHeroImage')}</p>
                        <img src={homepageContent.heroImageUrl} alt="Current Hero" className="w-full h-auto object-cover rounded-md shadow-sm border" />
                    </div>
                    <div>
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
                         {preview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700">{t('imagePreview')}</p>
                                <img src={preview} alt="New Hero Preview" className="mt-2 h-32 w-auto object-cover rounded-md shadow-sm border" />
                                 <div className="mt-4 flex justify-end gap-4">
                                    <button onClick={() => setPreview(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm">{t('cancel')}</button>
                                    <button onClick={handleSave} className="px-4 py-2 bg-brand-gold text-white rounded-md text-sm">{t('save')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHomepage;
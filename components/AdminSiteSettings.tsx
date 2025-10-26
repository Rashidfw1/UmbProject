
import React, { useContext, useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { UploadCloudIcon } from './Icons';
import { SocialMediaLinks } from '../types';

const AdminSiteSettings: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();
    const [preview, setPreview] = useState<string | null>(null);
    const [logoUploadError, setLogoUploadError] = useState<string>('');

    if (!context) return null;
    const { logoUrl, updateLogoUrl, socialMediaLinks, updateSocialMediaLinks } = context;
    
    const [links, setLinks] = useState<SocialMediaLinks | null>(socialMediaLinks);

    useEffect(() => {
        setLinks(socialMediaLinks)
    }, [socialMediaLinks]);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setLogoUploadError('');
        setPreview(null);

        if (rejectedFiles && rejectedFiles.length > 0) {
            const firstError = rejectedFiles[0].errors[0];
            if (firstError.code === 'file-too-large') {
                setLogoUploadError('File is too large. Max size is 1MB.');
            } else if (firstError.code === 'file-invalid-type') {
                 setLogoUploadError('Invalid file type. Please upload a PNG, JPG, SVG, or WEBP.');
            } else {
                 setLogoUploadError('An error occurred during file upload.');
            }
            return;
        }

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
        accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'], 'image/svg+xml': ['.svg'], 'image/webp': ['.webp'] },
        maxSize: 1 * 1024 * 1024, // 1MB
        multiple: false
    });

    const handleLogoSave = async () => {
        setLogoUploadError('');
        if (preview) {
            try {
                await updateLogoUrl(preview);
                alert('Logo updated successfully!');
                setPreview(null);
            } catch (e: any) {
                setLogoUploadError(e.message);
            }
        }
    };

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLinks(prev => prev ? ({ ...prev, [name]: value }) : null);
    };
    
    const handleLinksSave = async () => {
        if (links) {
            await updateSocialMediaLinks(links);
            alert('Social media links updated successfully!');
        }
    };
    
    // Fix: Explicitly check for context props AND local state to be ready before rendering.
    // This resolves the race condition where the component would get stuck in a loading state.
    if(!logoUrl || !socialMediaLinks || !links) return <div>Loading settings...</div>

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-brand-dark">{t('manageSiteSettings')}</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">{t('siteLogo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{t('currentLogo')}</p>
                        <div className="p-4 border rounded-md inline-block bg-gray-100">
                           <img src={logoUrl} alt="Current Logo" className="h-12 w-auto" />
                        </div>
                    </div>
                    <div>
                         <p className="text-sm font-medium text-gray-700 mb-2">{t('uploadNewLogo')}</p>
                         <div {...getRootProps()} className={`flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-brand-gold bg-brand-light/30' : 'hover:border-brand-gold/50'}`}>
                            <div className="space-y-1 text-center">
                                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                <div className="flex text-sm text-gray-600">
                                    <p className="relative bg-white rounded-md font-medium text-brand-gold hover:text-brand-dark focus-within:outline-none">
                                        <span>{t('dragAndDropOrClick')}</span>
                                        <input {...getInputProps()} className="sr-only" />
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500">{t('imageFileTypesLogo')}</p>
                            </div>
                        </div>
                         {logoUploadError && <p className="text-red-500 text-sm mt-2">{logoUploadError}</p>}
                         {preview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700">{t('imagePreview')}</p>
                                <div className="mt-2 p-4 border rounded-md inline-block bg-gray-100">
                                    <img src={preview} alt="New Logo Preview" className="h-12 w-auto" />
                                </div>
                                 <div className="mt-4 flex justify-end gap-4">
                                    <button onClick={() => {setPreview(null); setLogoUploadError('');}} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm">{t('cancel')}</button>
                                    <button onClick={handleLogoSave} className="px-4 py-2 bg-brand-gold text-white rounded-md text-sm">{t('save')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Social Media Links */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">{t('socialMediaLinks')}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('instagramUrl')}</label>
                        <input type="url" name="instagram" value={links.instagram} onChange={handleLinkChange} className="mt-1 block w-full input" placeholder="https://instagram.com/yourprofile"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('snapchatUrl')}</label>
                        <input type="url" name="snapchat" value={links.snapchat} onChange={handleLinkChange} className="mt-1 block w-full input" placeholder="https://snapchat.com/add/yourusername"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('twitterUrl')}</label>
                        <input type="url" name="twitter" value={links.twitter} onChange={handleLinkChange} className="mt-1 block w-full input" placeholder="https://twitter.com/yourhandle"/>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={handleLinksSave} className="px-6 py-2 bg-brand-gold text-white rounded-md text-sm font-semibold">{t('save')}</button>
                </div>
            </div>
            <style>{`.input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
        </div>
    );
};

export default AdminSiteSettings;


import React, { useContext, useState, ChangeEvent, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { AboutUsContent } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

const AdminAboutUs: React.FC = () => {
    const context = useContext(AppContext);
    const { t, language } = useLocalization();
    
    if (!context) return null;
    const { aboutUsContent, updateAboutUsContent } = context;

    const [content, setContent] = useState<AboutUsContent | null>(aboutUsContent);
    
    useEffect(() => {
        setContent(aboutUsContent);
    }, [aboutUsContent])

    // Fix: Check for context prop AND local state to be ready before rendering.
    // This resolves the race condition that caused the infinite loading state.
    if (!aboutUsContent || !content) return <div>Loading...</div>;

    const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('.');
        setContent(prev => prev ? ({
            ...prev,
            [field]: { ...prev[field as 'title' | 'coreValuesTitle'], [lang]: value }
        }) : null);
    };

    const handleParagraphChange = (index: number, lang: 'en' | 'ar', value: string) => {
        if(!content) return;
        const newParagraphs = [...content.paragraphs];
        newParagraphs[index] = { ...newParagraphs[index], [lang]: value };
        setContent(prev => prev ? ({ ...prev, paragraphs: newParagraphs }) : null);
    };
    
    const addParagraph = () => {
        setContent(prev => prev ? ({
            ...prev,
            paragraphs: [...prev.paragraphs, { en: '', ar: '' }]
        }) : null);
    };

    const removeParagraph = (index: number) => {
        setContent(prev => prev ? ({
            ...prev,
            paragraphs: prev.paragraphs.filter((_, i) => i !== index)
        }) : null);
    };

    const handleCoreValueChange = (index: number, field: 'title' | 'description', lang: 'en' | 'ar', value: string) => {
        if(!content) return;
        const newCoreValues = [...content.coreValues];
        newCoreValues[index] = {
            ...newCoreValues[index],
            [field]: { ...newCoreValues[index][field], [lang]: value }
        };
        setContent(prev => prev ? ({ ...prev, coreValues: newCoreValues }) : null);
    };

    const addCoreValue = () => {
        setContent(prev => prev ? ({
            ...prev,
            coreValues: [...prev.coreValues, { title: { en: '', ar: '' }, description: { en: '', ar: '' } }]
        }) : null);
    };
    
    const removeCoreValue = (index: number) => {
        setContent(prev => prev ? ({
            ...prev,
            coreValues: prev.coreValues.filter((_, i) => i !== index)
        }) : null);
    };

    const handleSave = async () => {
        if(content) {
            await updateAboutUsContent(content);
            alert('About Us content updated successfully!');
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                 <h2 className="text-2xl font-semibold text-brand-dark">{t('manageAboutUs')}</h2>
                 <button onClick={handleSave} className="px-6 py-2 bg-brand-gold text-white rounded-md text-sm font-semibold w-full sm:w-auto">{t('save')}</button>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-4">
                        {/* Main Title */}
                        <div className="space-y-2 p-4 border rounded-lg">
                             <h3 className="font-semibold text-gray-800">Main Title</h3>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">English</label>
                                <input type="text" name="title.en" value={content.title.en} onChange={handleTextChange} className="mt-1 block w-full input"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Arabic</label>
                                <input type="text" name="title.ar" value={content.title.ar} onChange={handleTextChange} className="mt-1 block w-full input" dir="rtl"/>
                            </div>
                        </div>

                        {/* Paragraphs */}
                        <div className="space-y-2 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                                 <h3 className="font-semibold text-gray-800">Content Paragraphs</h3>
                                 <button onClick={addParagraph} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md"><PlusIcon className="w-4 h-4"/> Add</button>
                            </div>
                           {content.paragraphs.map((p, index) => (
                               <div key={index} className="space-y-2 p-3 border-t relative">
                                    <h4 className="font-medium text-gray-600">Paragraph {index + 1}</h4>
                                    <button onClick={() => removeParagraph(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                   <div>
                                       <label className="block text-xs font-medium text-gray-600">English</label>
                                       <textarea value={p.en} onChange={(e) => handleParagraphChange(index, 'en', e.target.value)} rows={4} className="mt-1 block w-full input text-sm"></textarea>
                                   </div>
                                   <div>
                                       <label className="block text-xs font-medium text-gray-600">Arabic</label>
                                       <textarea value={p.ar} onChange={(e) => handleParagraphChange(index, 'ar', e.target.value)} rows={4} className="mt-1 block w-full input text-sm" dir="rtl"></textarea>
                                   </div>
                               </div>
                           ))}
                        </div>
                        
                        {/* Core Values */}
                        <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold text-gray-800">Core Values Section</h3>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Section Title (English)</label>
                                <input type="text" name="coreValuesTitle.en" value={content.coreValuesTitle.en} onChange={handleTextChange} className="mt-1 block w-full input"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Section Title (Arabic)</label>
                                <input type="text" name="coreValuesTitle.ar" value={content.coreValuesTitle.ar} onChange={handleTextChange} className="mt-1 block w-full input" dir="rtl"/>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t mt-4">
                                 <h3 className="font-semibold text-gray-800">Values</h3>
                                 <button onClick={addCoreValue} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md"><PlusIcon className="w-4 h-4"/> Add</button>
                            </div>
                             {content.coreValues.map((cv, index) => (
                               <div key={index} className="space-y-2 p-3 border-t relative">
                                    <h4 className="font-medium text-gray-600">Value {index + 1}</h4>
                                    <button onClick={() => removeCoreValue(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Title (EN)</label>
                                            <input value={cv.title.en} onChange={(e) => handleCoreValueChange(index, 'title', 'en', e.target.value)} className="mt-1 block w-full input text-sm" />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium text-gray-600">Title (AR)</label>
                                            <input value={cv.title.ar} onChange={(e) => handleCoreValueChange(index, 'title', 'ar', e.target.value)} className="mt-1 block w-full input text-sm" dir="rtl" />
                                        </div>
                                    </div>
                                   <div>
                                       <label className="block text-xs font-medium text-gray-600">Description (EN)</label>
                                       <textarea value={cv.description.en} onChange={(e) => handleCoreValueChange(index, 'description', 'en', e.target.value)} rows={2} className="mt-1 block w-full input text-sm"></textarea>
                                   </div>
                                   <div>
                                       <label className="block text-xs font-medium text-gray-600">Description (AR)</label>
                                       <textarea value={cv.description.ar} onChange={(e) => handleCoreValueChange(index, 'description', 'ar', e.target.value)} rows={2} className="mt-1 block w-full input text-sm" dir="rtl"></textarea>
                                   </div>
                               </div>
                           ))}
                        </div>

                    </div>
                    {/* Preview */}
                    <div className="border rounded-lg p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
                        <h4 className="font-semibold mb-4 text-center text-gray-600">Live Preview ({language.toUpperCase()})</h4>
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-2xl font-serif font-bold text-center text-brand-dark mb-4">
                                {content.title[language]}
                            </h1>
                             <div className="prose max-w-none text-brand-gray space-y-4">
                                {content.paragraphs.map((p, index) => (
                                    <p key={index}>{p[language]}</p>
                                ))}
                            </div>
                            <div className="mt-12 text-center">
                                <h2 className="text-xl font-serif font-bold text-brand-dark mb-4">
                                    {content.coreValuesTitle[language]}
                                </h2>
                                <div className="space-y-4">
                                     {content.coreValues.map((value, index) => (
                                        <div key={index} className="p-4 bg-white rounded-lg shadow-sm text-left rtl:text-right">
                                            <h3 className="font-semibold font-serif text-brand-gold">{value.title[language]}</h3>
                                            <p className="text-sm text-brand-gray">{value.description[language]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`.input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
        </div>
    );
};

export default AdminAboutUs;

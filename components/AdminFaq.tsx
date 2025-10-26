
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { FAQItem } from '../types';
import Modal from './Modal';
import { PlusIcon, EditIcon, TrashIcon, ChevronDownIcon } from './Icons';

const AdminFaq: React.FC = () => {
    const context = useContext(AppContext);
    const { t, language } = useLocalization();

    if (!context) return null;
    const { faqContent, updateFaqContent } = context;

    const [localFaqs, setLocalFaqs] = useState<FAQItem[] | null>(faqContent);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<FAQItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<FAQItem | null>(null);

    // Sync local state if context changes
    useEffect(() => {
        setLocalFaqs(faqContent);
    }, [faqContent]);
    
    const handleOpenModal = (item: FAQItem | null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (item: FAQItem) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleSaveItem = (itemData: FAQItem) => {
        if (!localFaqs) return;
        if (itemData.id) { // Editing
            setLocalFaqs(localFaqs.map(faq => faq.id === itemData.id ? itemData : faq));
        } else { // Adding
            setLocalFaqs([...localFaqs, { ...itemData, id: String(Date.now()) }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (itemToDelete && localFaqs) {
            setLocalFaqs(localFaqs.filter(faq => faq.id !== itemToDelete.id));
            setIsDeleteModalOpen(false);
        }
    };
    
    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!localFaqs) return;
        const newFaqs = [...localFaqs];
        const item = newFaqs[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (swapIndex < 0 || swapIndex >= newFaqs.length) return;

        newFaqs.splice(index, 1);
        newFaqs.splice(swapIndex, 0, item);
        setLocalFaqs(newFaqs);
    };

    const handleSaveChanges = async () => {
        if (localFaqs) {
            await updateFaqContent(localFaqs);
            alert('FAQ content updated successfully!');
        }
    };
    
    // Fix: Explicitly check for context prop AND local state to be ready before rendering.
    // This resolves the race condition that caused the infinite loading state.
    if(!faqContent || !localFaqs) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-brand-dark">{t('manageFaq')}</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                     <button onClick={() => handleOpenModal(null)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors text-sm font-semibold">
                        <PlusIcon className="w-4 h-4" /> Add New
                    </button>
                    <button onClick={handleSaveChanges} className="flex-1 sm:flex-none px-6 py-2 bg-brand-gold text-white rounded-md text-sm font-semibold">{t('save')}</button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Editor */}
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                        <h3 className="font-semibold text-lg text-gray-800">Manage Questions</h3>
                        {localFaqs.map((faq, index) => (
                             <div key={faq.id} className="p-4 border rounded-lg flex items-start gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold">{faq.question[language] || faq.question.en}</p>
                                    <p className="text-sm text-gray-600 mt-1 truncate">{faq.answer[language] || faq.answer.en}</p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <div className="flex flex-col">
                                        <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg></button>
                                        <button onClick={() => moveItem(index, 'down')} disabled={index === localFaqs.length - 1} className="p-1 disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                                    </div>
                                    <button onClick={() => handleOpenModal(faq)} className="p-2 text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleOpenDeleteModal(faq)} className="p-2 text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                             </div>
                        ))}
                    </div>
                    {/* Preview */}
                    <div className="border rounded-lg p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
                        <h4 className="font-semibold mb-4 text-center text-gray-600">Live Preview ({language.toUpperCase()})</h4>
                         <div className="space-y-4">
                            {localFaqs.map((item) => (
                                <details key={item.id} className="group bg-white rounded-lg p-4 cursor-pointer" name="faq-preview">
                                    <summary className="flex justify-between items-center font-semibold text-brand-dark list-none">
                                        {item.question[language]}
                                        <ChevronDownIcon className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
                                    </summary>
                                    <div className="mt-2 text-brand-gray text-sm prose">
                                        <p>{item.answer[language]}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                 </div>
            </div>

            {isModalOpen && <FaqFormModal item={currentItem} onSave={handleSaveItem} onClose={() => setIsModalOpen(false)} />}
            {isDeleteModalOpen && itemToDelete && (
                 <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                    <div>
                        <p>Are you sure you want to delete this FAQ item? This action cannot be undone.</p>
                        <p className="mt-2 font-semibold bg-gray-100 p-2 rounded">Q: {itemToDelete.question[language] || itemToDelete.question.en}</p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">{t('delete')}</button>
                        </div>
                    </div>
                </Modal>
            )}
            <style>{`.prose p { margin: 0; } details[name="faq-preview"] summary::-webkit-details-marker { display: none; }`}</style>
        </div>
    );
};

// Form Modal Component
interface FaqFormModalProps {
    item: FAQItem | null;
    onSave: (item: FAQItem) => void;
    onClose: () => void;
}
const FaqFormModal: React.FC<FaqFormModalProps> = ({ item, onSave, onClose }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Omit<FAQItem, 'id'>>({
        question: item?.question || { en: '', ar: '' },
        answer: item?.answer || { en: '', ar: '' },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'question' | 'answer', lang: 'en' | 'ar') => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: e.target.value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: item?.id || '' });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={item ? "Edit FAQ" : "Add New FAQ"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Question (English)</label>
                    <input type="text" value={formData.question.en} onChange={(e) => handleChange(e, 'question', 'en')} required className="mt-1 block w-full input"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Question (Arabic)</label>
                    <input type="text" value={formData.question.ar} onChange={(e) => handleChange(e, 'question', 'ar')} required className="mt-1 block w-full input" dir="rtl"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Answer (English)</label>
                    <textarea value={formData.answer.en} onChange={(e) => handleChange(e, 'answer', 'en')} required rows={4} className="mt-1 block w-full input"></textarea>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Answer (Arabic)</label>
                    <textarea value={formData.answer.ar} onChange={(e) => handleChange(e, 'answer', 'ar')} required rows={4} className="mt-1 block w-full input" dir="rtl"></textarea>
                </div>
                 <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-brand-gold text-white rounded-md">{t('save')}</button>
                </div>
            </form>
             <style>{`.input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
        </Modal>
    )
}


export default AdminFaq;

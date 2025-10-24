import React, { useState, useContext, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { Product } from '../types';
import Modal from './Modal';
import { PlusIcon, EditIcon, TrashIcon, UploadCloudIcon } from './Icons';

const AdminProducts: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    if (!context) return null;
    const { products, setProducts } = context;
    
    const openModal = (product: Product | null) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentProduct(null);
        setIsModalOpen(false);
    };
    
    const openDeleteModal = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setProductToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleSave = (productData: Product) => {
        if (currentProduct && currentProduct.id) { // Editing existing product
            setProducts(products.map(p => p.id === productData.id ? productData : p));
        } else { // Adding new product
            setProducts([...products, { ...productData, id: String(Date.now()) }]);
        }
        closeModal();
    };
    
    const handleDelete = () => {
        if (productToDelete) {
            setProducts(products.filter(p => p.id !== productToDelete.id));
            closeDeleteModal();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-brand-dark">{t('manageProducts')}</h2>
                <button
                    onClick={() => openModal(null)}
                    className="flex items-center gap-2 bg-brand-gold text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    {t('addNewProduct')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('product')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('price')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-brand-dark">{product.name.en}</div>
                                            <div className="text-sm text-gray-500">{product.name.ar}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.price)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-900">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <ProductFormModal product={currentProduct} onSave={handleSave} onClose={closeModal} />}
            {isDeleteModalOpen && (
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title={t('confirmDelete')}>
                    <div>
                        <p>{t('areYouSureDeleteProduct')}</p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">{t('deleteProduct')}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

interface ProductFormModalProps {
    product: Product | null;
    onSave: (product: Product) => void;
    onClose: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onSave, onClose }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: { en: product?.name.en || '', ar: product?.name.ar || '' },
        description: { en: product?.description.en || '', ar: product?.description.ar || '' },
        price: product?.price || 0,
        imageUrl: product?.imageUrl || '',
        category: product?.category || 'necklaces',
    });
    const [preview, setPreview] = useState<string | null>(product?.imageUrl || null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const resultStr = reader.result as string;
                setPreview(resultStr);
                setFormData(prev => ({ ...prev, imageUrl: resultStr }));
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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [field, lang] = name.split('.');
            setFormData(prev => ({ ...prev, [field]: { ...(prev[field as 'name' | 'description']), [lang]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id || '' });
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={product ? t('editProduct') : t('addNewProduct')}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('productNameEn')}</label>
                        <input type="text" name="name.en" value={formData.name.en} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('productNameAr')}</label>
                        <input type="text" name="name.ar" value={formData.name.ar} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('descriptionEn')}</label>
                        <textarea name="description.en" value={formData.description.en} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('descriptionAr')}</label>
                        <textarea name="description.ar" value={formData.description.ar} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('price')} (OMR)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.001" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('category')}</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="necklaces">Necklaces</option>
                                <option value="rings">Rings</option>
                                <option value="bracelets">Bracelets</option>
                                <option value="earrings">Earrings</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('productImage')}</label>
                        <div {...getRootProps()} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-brand-gold bg-brand-light/30' : 'hover:border-brand-gold/50'}`}>
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
                                <img src={preview} alt="Product Preview" className="mt-2 h-32 w-32 object-cover rounded-md shadow-sm" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-brand-gold text-white rounded-md">{t('save')}</button>
                </div>
            </form>
        </Modal>
    );
}

export default AdminProducts;
import React, { useContext, useState } from 'react';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { User, UserRole, UserStatus } from '../types';
import Modal from './Modal';
import { PlusIcon, EditIcon, TrashIcon, KeyIcon } from './Icons';
import { translations } from '../data/localization';

const AdminUsers: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToResetPass, setUserToResetPass] = useState<User | null>(null);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    if (!context) return null;
    const { users, addUser, updateUser, deleteUser, resetUserPassword } = context;

    const openModal = (user: User | null) => {
        setCurrentUser(user);
        setFeedback({ message: '', type: '' });
        setIsModalOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };
    
    const openResetPassModal = (user: User) => {
        setUserToResetPass(user);
        setIsResetPassModalOpen(true);
    };

    const handleSave = (userData: User) => {
        const result = userData.id ? updateUser(userData) : addUser(userData);
        if (result.success) {
            setIsModalOpen(false);
        } else {
            setFeedback({ message: t(result.message as keyof typeof translations['en']), type: 'error' });
        }
    };

    const handleDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };
    
    const handleResetPassword = (userId: string, newPass: string) => {
        return resetUserPassword(userId, newPass);
    };
    
    const getStatusClass = (status: UserStatus) => {
        switch(status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-yellow-100 text-yellow-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-brand-dark">{t('userManagement')}</h2>
                <button
                    onClick={() => openModal(null)}
                    className="flex items-center gap-2 bg-brand-gold text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    {t('addNewUser')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('userName')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: User) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-dark">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusClass(user.status)}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openResetPassModal(user)} className="text-gray-500 hover:text-gray-800 mr-4" title={t('resetPassword')}><KeyIcon className="w-5 h-5"/></button>
                                    <button onClick={() => openModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4" title={t('editUser')}><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900" title={t('deleteUser')}><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <UserFormModal user={currentUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} feedback={feedback}/>}
            {isDeleteModalOpen && (
                 <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('confirmDeleteUser')}>
                    <div>
                        <p>{t('areYouSureDeleteUser')}</p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">{t('deleteUser')}</button>
                        </div>
                    </div>
                </Modal>
            )}
             {isResetPassModalOpen && userToResetPass && (
                 <ResetPasswordModal 
                    user={userToResetPass}
                    onClose={() => {
                        setIsResetPassModalOpen(false);
                        setUserToResetPass(null);
                    }}
                    onReset={handleResetPassword}
                 />
            )}
        </div>
    );
};

interface UserFormModalProps {
    user: User | null;
    onSave: (user: User) => void;
    onClose: () => void;
    feedback: { message: string, type: string };
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onSave, onClose, feedback }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Omit<User, 'id'>>({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'customer',
        status: user?.status || 'active',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: user?.id || '' });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={user ? t('editUser') : t('addNewUser')}>
             <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {feedback.message && <p className={`${feedback.type === 'error' ? 'text-red-500' : 'text-green-600'} text-sm`}>{feedback.message}</p>}
                    <div>
                        <label className="block text-sm font-medium">{t('name')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full input"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('email')}</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full input"/>
                    </div>
                    {!user && (
                         <div>
                            <label className="block text-sm font-medium">{t('password')}</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full input"/>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">{t('role')}</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full input">
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('status')}</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full input">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
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

interface ResetPasswordModalProps {
    user: User;
    onClose: () => void;
    onReset: (userId: string, newPass: string) => { success: boolean; message: string; };
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose, onReset }) => {
    const { t } = useLocalization();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword) {
            setError(t('passwordCannotBeEmpty'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }
        
        const result = onReset(user.id, newPassword);
        if (result.success) {
            alert(t('passwordResetSuccessfully'));
            onClose();
        } else {
            setError(t(result.message as keyof typeof translations['en']));
        }
    };
    
    return (
         <Modal isOpen={true} onClose={onClose} title={t('setNewPassword')}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">{t('enterNewPasswordFor', { name: user.name })}</p>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium">{t('newPassword')}</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            className="mt-1 block w-full input"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('confirmNewPassword')}</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="mt-1 block w-full input"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-brand-gold text-white rounded-md">{t('resetPassword')}</button>
                </div>
            </form>
            <style>{`.input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
        </Modal>
    );
}


export default AdminUsers;
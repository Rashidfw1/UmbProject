import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { ChevronDownIcon } from '../components/Icons';

const FaqPage: React.FC = () => {
    const context = useContext(AppContext);
    const { t, getLocalized } = useLocalization();

    if (!context || !context.faqContent) {
        return <div>Loading...</div>;
    }

    const { faqContent } = context;

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-brand-dark mb-12 animate-fade-in-down">
                        {t('faqTitle')}
                    </h1>

                    <div className="space-y-4">
                        {faqContent.map((item) => (
                            <details key={item.id} className="group bg-brand-light/50 rounded-lg p-6 cursor-pointer" name="faq">
                                <summary className="flex justify-between items-center font-semibold text-brand-dark text-lg list-none">
                                    {getLocalized(item.question)}
                                    <ChevronDownIcon className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
                                </summary>
                                <div className="mt-4 text-brand-gray prose">
                                    <p>{getLocalized(item.answer)}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
             <style>{`
                .prose p {
                    line-height: 1.75;
                }
                 details[name="faq"] summary::-webkit-details-marker {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default FaqPage;
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';

const AboutUsPage: React.FC = () => {
    const context = useContext(AppContext);
    const { getLocalized } = useLocalization();

    if (!context || !context.aboutUsContent) {
        return <div>Loading...</div>;
    }

    const { aboutUsContent } = context;

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-brand-dark mb-8 animate-fade-in-down">
                        {getLocalized(aboutUsContent.title)}
                    </h1>
                    
                    <div className="prose prose-lg max-w-none text-brand-gray space-y-6 animate-fade-in-up">
                        {aboutUsContent.paragraphs.map((p, index) => (
                            <p key={index}>{getLocalized(p)}</p>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-serif font-bold text-brand-dark mb-8">
                            {getLocalized(aboutUsContent.coreValuesTitle)}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {aboutUsContent.coreValues.map((value, index) => (
                                <div key={index} className="p-6 bg-brand-light/50 rounded-xl shadow-subtle">
                                    <h3 className="text-xl font-semibold font-serif text-brand-gold mb-2">{getLocalized(value.title)}</h3>
                                    <p className="text-brand-gray">{getLocalized(value.description)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .prose p {
                    line-height: 1.75;
                }
            `}</style>
        </div>
    );
};

export default AboutUsPage;
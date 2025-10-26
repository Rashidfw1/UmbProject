// All fees in OMR

// Wilayahs with a custom, higher delivery rate for home delivery.
// Note: 'Marmul' and 'Shalim' were not found in the geography data and are omitted.
export const SPECIAL_RATE_WILAYAHS = [
    'khasab', // Musandam
    'thumrait', // Dhofar
    'al_jazer', // Al Wusta
    'masirah', // South Sharqiyah
    'duqm', // Al Wusta
    'mahoot', // Al Wusta
];

/**
 * Calculates the delivery fee based on shipping destination and type.
 * @param country - The key for the selected country (e.g., 'oman', 'uae').
 * @param deliveryType - The type of delivery, only applicable for Oman ('home' or 'office').
 * @param wilayah - The key for the selected wilayah, used for special rate checks in Oman.
 * @returns The calculated delivery fee in OMR.
 */
export const getDeliveryFee = (country: string, deliveryType?: 'home' | 'office', wilayah?: string): number => {
    switch (country) {
        case 'oman':
            if (deliveryType === 'office') {
                return 1.000; // Flat rate for office delivery
            }
            if (deliveryType === 'home') {
                // Check if the selected wilayah is in the special rate list
                if (wilayah && SPECIAL_RATE_WILAYAHS.includes(wilayah)) {
                    return 3.000; // Custom higher rate
                }
                return 2.000; // Standard home delivery rate
            }
            return 0; // If delivery type for Oman is not specified

        case 'uae':
            return 4.000; // Special rate for UAE

        case 'saudi_arabia':
        case 'qatar':
        case 'bahrain':
        case 'kuwait':
            return 5.000; // Standard GCC rate

        default:
            return 0; // Default case if country is not selected or not supported
    }
};
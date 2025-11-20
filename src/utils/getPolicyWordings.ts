export const getPolicyWording = (apiUserName: string | null | undefined, productName: string, isTakaful: boolean, hasFBLRiders: boolean) => {
    console.log("API USER NAME: ", apiUserName);
    let wordingFile = '';
    let extraUrls = [];
    const accountNo = apiUserName;
    const isFranchise = accountNo?.includes('franchise');
    const isFaysalBank = accountNo?.includes('faysalbank');
    const isMIB = accountNo?.includes('mib');
    const isDaraz = accountNo?.includes('daraz');
    const hasFBLRider = hasFBLRiders || false;

    if (isTakaful) {
        if (isFaysalBank) {
            if (productName === 'FBL-Takaful Health Cover' || productName === 'FBL-Personal Accident') {
                wordingFile = 'FBLHealthCarePolicyWording.pdf';
            } else if (productName === 'FBL-Takaful Family Health Cover') {
                wordingFile = 'FBLFamilyHealthCarePolicyWording.pdf';
            } else if (productName.includes('Female Centric Health Takaful')) {
                wordingFile = 'FemaleCentric.pdf';
            }
        } else if (isMIB) {
            if (productName === 'MIB Personal Health Takaful') {
                wordingFile = 'MIBPersonalHealthCare.pdf';
            } else if (productName === 'MIB Family Health Takaful') {
                wordingFile = 'MIBFamilyHealthCare.pdf';
            }
        } else if (accountNo?.includes('telemart')) {
            wordingFile = 'PurchaseProtectionTakafulWording.pdf';
        } else if (productName.includes('Parents-Care-Plus-Takaful')) {
            wordingFile = 'parents-care-plus-wording-takaful.pdf';
        } else if (productName.toLowerCase().includes('selfcare')) { 
            wordingFile = 'SelfCareTakafulWordingsFinal.pdf';
        } else if (productName.toLowerCase().includes('homecare')) {
            wordingFile = 'HomeCareTakafulWordings.pdf';
        } else if (productName.toLowerCase().includes('domestic ')) {
            wordingFile = 'ViaCareTravelTakafulDomesticWordingsFinal.pdf';
        }else if (productName.toLowerCase().includes('viacare')) {
            wordingFile = 'policy-wording-travel.pdf';
        }else if (productName.toLowerCase().includes('personal healthcare')) {
            wordingFile = 'policy-wording-personal.pdf';
        }
    } else {
        if (isDaraz) {
            wordingFile = 'DarazPurchaseProtection.pdf';
        } else if (productName === 'HBL-Hospital Daily Cash Product') {
            wordingFile = 'HBLHospitalDailyCashProductWording.pdf';
        } else if (accountNo === 'hblbanca') {
            wordingFile = 'HBLHospitalCashInsurance.pdf';
        } else if (isFaysalBank && productName === 'FBL-Personal Accident') {
            wordingFile = 'AccidentTakafulWordingsFinalAsper2012Rules22042015.pdf';
        } else if (productName.includes('Parents-Care-Plus')) {
            wordingFile = 'Parents-Care-plus-wording-insurance.pdf';
        } else if (accountNo === 'mmbl') {
            wordingFile = 'MB-SehatSarmayaHealthCover.pdf';
        } else if (accountNo?.includes('bookme') && productName === 'ViaCare') {
            wordingFile = 'ViaCarePolicyWording_BM.pdf';
        } else if (productName.toLowerCase().includes('selfcare')) {
            wordingFile = 'SelfCarePolicyWording.pdf';
        } else if (productName.toLowerCase().includes('homecare')) {
            wordingFile = 'HomeCarePolicyWording.pdf';
        } else if (productName.toLowerCase().includes('viacare')){
            wordingFile = 'ViaCarePolicyWording.pdf';
        } else if (productName.toLowerCase().includes('via care')){
            wordingFile = 'ViaCarePolicyWording.pdf';
        } else if (productName.toLowerCase().includes('family healthcare')) {
            wordingFile = 'policy-wording-family.pdf';
        }else if (productName.toLowerCase().includes('personal healthcare')) {
            wordingFile = 'policy-wording-personal.pdf';
        }else {
            wordingFile = 'HealthCarePolicyWording.pdf'; // Default non-Takaful
        }
    }

    // Special extras
    if (isFranchise) {
        extraUrls.push('PanelHospitals.pdf');
        extraUrls.push('DiscountCentres.pdf');
    }
    if (hasFBLRider && isFaysalBank) {
        extraUrls.push('AccidentTakafulWordingsFinalAsper2012Rules22042015.pdf');
    }

    return { wordingFile, extraUrls };
}
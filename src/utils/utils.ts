// src/utils/utils.ts

import dayjs from 'dayjs';

/**
 * Emulates the Java Utilities.calculateAge(dobString)
 */
export function calculateAge(dobString: string | null | undefined): number {
    if (!dobString) return 0;
    
    // Attempt to parse various date formats (Java uses Date object, we use string/dayjs)
    const dob = dayjs(dobString);
    if (!dob.isValid()) return 0;

    return dayjs().diff(dob, 'year');
}

/**
 * Emulates CommonFunctions.isFBLRiderPresent
 */
export function isFBLRiderPresent(isFaysalBankOrder: boolean, policy: any): boolean {
    // This logic needs external context, mocking based on simple assumption
    return isFaysalBankOrder && (policy.FblPolicyRider?.length > 0);
}
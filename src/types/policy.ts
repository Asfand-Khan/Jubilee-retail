// src/types/policy.ts
import { Policy, Order, Plan, Product, ProductOption, PolicyDetail, ApiUser, FblPolicyRider, WebappMapper } from '@prisma/client';
import { calculateAge } from '../utils/utils';

// 1. Define the complete, nested data structure
export type PolicyWithRelations = Policy & {
    order: (Order & {
        payemntMethod: { name: string, payment_code: string } | null;
    }) | null;
    plan: Plan | null;
    product: Product | null;
    productOption: (ProductOption & {
        webappMappers: WebappMapper[];
    }) | null;
    apiUser: ApiUser | null;
    policyDetails: PolicyDetail[];
    FblPolicyRider: FblPolicyRider[];
    // Include other nested types if needed (e.g., PolicyPurchaseProtection, PolicyExtendedWarranty)
    PolicyPurchaseProtection?: any[];
    PolicyExtendedWarranty?: any;
};

// 2. Helper class to mirror Java's dynamic access methods
export class PolicyDataAccessor {
    public policy: PolicyWithRelations;

    constructor(policy: PolicyWithRelations) {
        this.policy = policy;
    }

    // Mimics policy.getCustomer(type)
    getCustomer(type: string): (PolicyDetail & {
        getFirstName: () => string;
        getCnic: () => string;
        getAddress: () => string;
        getContactNumber: () => string;
        getEmail: () => string;
        getAge: () => number;
        getParentsOrInlaw: () => string;
        getParentsMotherName: () => string;
        getParentsFatherName: () => string;
        getParentsMotherCnic: () => string;
        getParentsFatherCnic: () => string;
        getParentsMotherDob: () => string | null;
        getParentsFatherDob: () => string | null;
        getParentsAddress: () => string; // Assuming these fields exist somewhere, linking to LeadInfo fields
        getParentsContact: () => string;
        getRelation: () => string;
        getPassport: () => string;
        getCity: () => string;
    }) | undefined {
        const detail = this.policy.policyDetails.find(d => 
            d.type.toLowerCase() === type.toLowerCase()
            || (type === 'Customer' && d.type.toLowerCase() === 'main_insured')
            || (type === 'Beneficiary' && d.type.toLowerCase() === 'beneficiary')
        );

        if (!detail) return undefined;

        // Augment the PolicyDetail with Java-style dynamic getters/fields
        const augmentedDetail: any = {
            ...detail,
            getFirstName: () => detail.name,
            getCnic: () => detail.cnic || '',
            getAddress: () => detail.address || this.policy.order?.customer_address || '',
            getContactNumber: () => detail.contact_number || this.policy.order?.customer_contact || '',
            getEmail: () => detail.email || this.policy.order?.customer_email || '',
            getAge: () => detail.age || calculateAge(detail.dob),
            getCity: () => detail.city || this.policy.order?.customer_city || '',
            getPassport: () => detail.passport_no || '',
            getRelation: () => detail.relation || '',

            // Mocked accessors for ParentCare data (assumed to be stored in Order/PolicyDetail or a linked model)
            // In a real app, this data needs to be explicitly included in the Prisma query/model.
            getParentsOrInlaw: () => (this.policy.order as any)?.parents_or_inlaw || '',
            getParentsMotherName: () => (this.policy.order as any)?.parents_mother_name || 'Mother Name Mock',
            getParentsFatherName: () => (this.policy.order as any)?.parents_father_name || 'Father Name Mock',
            getParentsMotherCnic: () => (this.policy.order as any)?.parents_mother_cnic || '12345-6789012-3',
            getParentsFatherCnic: () => (this.policy.order as any)?.parents_father_cnic || '32109-8765432-1',
            getParentsMotherDob: () => (this.policy.order as any)?.parents_mother_dob || null,
            getParentsFatherDob: () => (this.policy.order as any)?.parents_father_dob || null,
            getParentsAddress: () => (this.policy.order as any)?.parents_address || 'Mock Address',
            getParentsContact: () => (this.policy.order as any)?.parents_contact || '0300-1111111',
        };

        return augmentedDetail;
    }

    // Mimics policy.isTakafull()
    isTakaful(): boolean {
        return this.policy.takaful_policy;
    }

    // Mimics policy.getFblRiders()
    getFblRiders(): FblPolicyRider[] {
        return this.policy.FblPolicyRider;
    }
    
    // Mimics policy.getTotalPrice() (needs string to float conversion)
    getTotalPrice(): number {
        return parseFloat(this.policy.received_premium || '0.00');
    }
    
    // Mimics policy.getFilerTaxPerItem() (needs string to float conversion)
    getFilerTaxPerItem(): number {
        return parseFloat(this.policy.filer_tax_per_item || '0.00');
    }

    // Mock policy.getFilerTaxStatus() which is missing in Prisma but used in Java
    getFilerTaxStatus(): string {
        return this.policy.filer_tax_status ? 'Filer' : 'Non-Filer';
    }

    // Mock policy.getSumInsured()
    getSumInsured(): number {
        return parseFloat(this.policy.sum_insured || '0.00');
    }

    // Mock access to MagentoWebappMappers
    getMagentoChildSku(): string {
        return this.policy.productOption?.webappMappers?.[0]?.child_sku || '';
    }
}
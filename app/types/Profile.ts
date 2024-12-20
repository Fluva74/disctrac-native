export interface PlayerProfile {
    email?: string;
    phone?: string;
    pdgaNumber?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    teamName?: string;
    contactPreferences?: {
        email: boolean;
        phone: boolean;
        inApp: boolean;
    };
    avatarUrl?: string;
}

export interface StoreProfile {
    name: string;
    contactPreferences: {
        email: boolean;
        phone: boolean;
        inApp: boolean;
    };
    
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    website?: string;
    hours?: string;
    avatarUrl?: string;
} 
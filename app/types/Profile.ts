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
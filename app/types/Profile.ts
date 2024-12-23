export interface ContactPreferences {
  phone: boolean;
  email: boolean;
  inApp: boolean;
}

export interface PlayerProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  pdgaNumber?: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  teamName?: string;
  contactPreferences?: ContactPreferences;
}

export interface StoreProfile {
  storeName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  hours?: string;
  avatarUrl?: string;
  holdTime?: number;
  contactPreferences?: ContactPreferences;
} 
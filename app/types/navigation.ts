import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlayerProfile, StoreProfile } from './Profile';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: {
    profile: PlayerProfile;
  };
  StoreDetails: {
    storeId: string;
  };
  EditStoreProfile: {
    profile: StoreProfile;
  };
  StoreInventory: undefined;
  MessageDetail: {
    messageId: string;
    receiverInfo: {
      id: string;
      name: string;
    };
  };
  StoreScanResult: {
    discId: string;
  };
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type MessageDetailRouteProp = RouteProp<RootStackParamList, 'MessageDetail'>;
export type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;
export type EditStoreProfileRouteProp = RouteProp<RootStackParamList, 'EditStoreProfile'>;
export type StoreDetailsRouteProp = RouteProp<RootStackParamList, 'StoreDetails'>;
export type StoreScanResultRouteProp = RouteProp<RootStackParamList, 'StoreScanResult'>; 
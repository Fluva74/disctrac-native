import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from '../modals/BaseModal';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';

interface DiscFoundModalProps {
  visible: boolean;
  onClose: () => void;
  onNotifyOwner: () => void;
  ownerName: string;
  userId: string;
  discDetails: {
    id: string;
    name: string;
    manufacturer: string;
    color: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    inApp: boolean;
    preferredMethod: 'email' | 'phone' | 'inApp';
  };
}

const colorToImageMap: { [key: string]: any } = {
  discAqua: require('../../../assets/discAqua.png'),
  discBlack: require('../../../assets/discBlack.png'),
  discBlue: require('../../../assets/discBlue.png'),
  discBrown: require('../../../assets/discBrown.png'),
  discClear: require('../../../assets/discClear.png'),
  discCream: require('../../../assets/discCream.png'),
  discDarkBlue: require('../../../assets/discDarkBlue.png'),
  discGlow: require('../../../assets/discGlow.png'),
  discGray: require('../../../assets/discGray.png'),
  discGreen: require('../../../assets/discGreen.png'),
  discHotPink: require('../../../assets/discHotPink.png'),
  discLime: require('../../../assets/discLime.png'),
  discMaroon: require('../../../assets/discMaroon.png'),
  discOrange: require('../../../assets/discOrange.png'),
  discPaleBlue: require('../../../assets/discPaleBlue.png'),
  discPaleGreen: require('../../../assets/discPaleGreen.png'),
  discPalePink: require('../../../assets/discPalePink.png'),
  discPalePurple: require('../../../assets/discPalePurple.png'),
  discPink: require('../../../assets/discPink.png'),
  discPurple: require('../../../assets/discPurple.png'),
  discRed: require('../../../assets/discRed.png'),
  discSkyBlue: require('../../../assets/discSkyBlue.png'),
  discTeal: require('../../../assets/discTeal.png'),
  discTieDye: require('../../../assets/discTieDye.png'),
  discWhite: require('../../../assets/discWhite.png'),
  discYellow: require('../../../assets/discYellow.png'),
};

const DiscFoundModal: React.FC<DiscFoundModalProps> = ({
  visible,
  onClose,
  onNotifyOwner,
  ownerName,
  userId,
  discDetails,
  contactInfo,
}) => {
  const getDiscImage = (color: string) => {
    const formattedColor = color.startsWith('disc') 
      ? color 
      : 'disc' + color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
      
    console.log('Color from disc:', color);
    console.log('Formatted color:', formattedColor);
    console.log('Available colors:', Object.keys(colorToImageMap));
    return colorToImageMap[formattedColor] || colorToImageMap.discGray;
  };

  const getEnabledContactMethods = () => {
    const methods = [];
    
    if (contactInfo.email) {
      methods.push({ type: 'email', value: contactInfo.email });
    }

    if (contactInfo.phone) {
      methods.push({ type: 'phone', value: contactInfo.phone });
    }

    if (contactInfo.inApp) {
      methods.push({ type: 'inApp', value: 'In-App Messages' });
    }

    return methods;
  };

  const handleNotifyOwner = async () => {
    try {
      console.log('Starting notification creation for user:', userId);
      // First create the notification
      const notificationRef = await addDoc(collection(FIREBASE_DB, 'notifications'), {
        userId: userId,
        discId: discDetails.id,
        discName: discDetails.name,
        company: discDetails.manufacturer,
        timestamp: serverTimestamp(),
        type: 'DISC_FOUND',
        read: false
      });
      console.log('Notification created successfully with ID:', notificationRef.id);

      // Then navigate to messaging
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        console.log('No current user found');
        return;
      }
      
      // Call the onNotifyOwner prop which handles navigation
      onNotifyOwner();

    } catch (error) {
      console.error('Error creating notification:', error);
      // Log the full error details
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.header}>This Disc Belongs To</Text>
        <Text style={styles.ownerName}>{ownerName}</Text>
        
        <View style={styles.contentRow}>
          <View style={styles.discInfoContainer}>
            <Text style={styles.label}>Disc Name</Text>
            <Text style={styles.value}>{discDetails.name}</Text>
            
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{discDetails.manufacturer}</Text>
          </View>

          <View style={styles.discImageContainer}>
            <Image 
              source={getDiscImage(discDetails.color)}
              style={styles.discImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.contactInfoContainer}>
          <Text style={styles.label}>Contact Methods</Text>
          {getEnabledContactMethods().map((method, index) => (
            <View 
              key={method.type}
              style={[
                styles.contactMethod,
                index > 0 && styles.contactMethodDivider
              ]}
            >
              <Text style={styles.value}>
                {method.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleNotifyOwner} style={styles.notifyButton}>
            <LinearGradient
              colors={['#44FFA1', '#44FFA1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.notifyButtonText}>Message In App</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  header: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  ownerName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  contentRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discInfoContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  discImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  discImage: {
    width: '80%',
    height: '80%',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  notifyButton: {
    width: '100%',
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
  },
  notifyButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  contactInfoContainer: {
    width: '100%',
    marginBottom: 24,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  contactMethod: {
    marginBottom: 8,
  },
  contactMethodDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
});

export default DiscFoundModal; 
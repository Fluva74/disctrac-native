import React, { useEffect } from 'react';
import { Button, View, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

const populateDiscDatabase = async () => {
    const discCollection = collection(FIREBASE_DB, 'discmain');

    const companies = ["Innova", "Discraft", "Dynamic Discs", "Latitude 64", "MVP"];
    const molds = ["Destroyer", "Buzz", "Judge", "Pure", "Envy"];
    const colors = ["Red", "Blue", "Green", "Yellow", "Purple"];

    for (let i = 1; i <= 100; i++) {
        const disc = {
            uid: `disc_${i}`,  // Unique identifier for each disc
            company: companies[Math.floor(Math.random() * companies.length)],
            mold: molds[Math.floor(Math.random() * molds.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
        };

        try {
            await addDoc(discCollection, disc);
            console.log(`Disc ${i} added:`, disc);
        } catch (error) {
            console.error("Error adding disc:", error);
        }
    }

    Alert.alert("Database populated", "100 disc records have been added to Firestore.");
};

const PopulateDatabase = () => {
    return (
        <View>
            <Button title="Populate Database" onPress={populateDiscDatabase} />
        </View>
    );
};

export default PopulateDatabase;

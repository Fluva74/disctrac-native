// TestAutoCompleteDropdown.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

const TestAutoCompleteDropdown = () => {
  const [companySuggestions, setCompanySuggestions] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = useCallback(async (text: string) => {
    console.log("fetchCompanies called with text:", text);

    if (text.length < 2) {
        console.log("Text too short, not fetching suggestions.");
        setCompanySuggestions([]);
        return;
    }

    setLoading(true);

    try {
        const companiesRef = collection(FIREBASE_DB, 'companies');

        // Debug 1: Retrieve all companies without filtering to ensure we are accessing data.
        const allCompaniesSnapshot = await getDocs(companiesRef);
        const allCompanies = allCompaniesSnapshot.docs.map(doc => doc.data());
        console.log("All companies in Firestore:", allCompanies);

        // Applying uppercase to match case-sensitivity if your data is stored with uppercase initials
        const queryText = text.charAt(0).toUpperCase() + text.slice(1);

        // Debug 2: Simplify the query to direct matches, as an experiment
        const q = query(companiesRef, where('name', '>=', queryText), where('name', '<=', queryText + '\uf8ff'));
        const querySnapshot = await getDocs(q);

        const companies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().name
        }));

        console.log("Filtered companies fetched:", companies);

        setCompanySuggestions(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);
    } finally {
        setLoading(false);
    }
}, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Autocomplete for Company</Text>
      <AutocompleteDropdown
        dataSet={companySuggestions}
        onChangeText={fetchCompanies}
        loading={loading}
        inputContainerStyle={styles.inputContainer}
        suggestionsListContainerStyle={styles.suggestionsContainer}
        emptyResultText="Nothing found"
        textInputProps={{
          placeholder: 'Enter company name',
          autoCorrect: false,
          autoCapitalize: 'none',
          style: {
            padding: 8,
            borderRadius: 5,
            backgroundColor: '#FFF',
            borderColor: '#4CAF50',
            borderWidth: 1
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
  },
  suggestionsContainer: {
    backgroundColor: '#FFF',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
});

export default TestAutoCompleteDropdown;

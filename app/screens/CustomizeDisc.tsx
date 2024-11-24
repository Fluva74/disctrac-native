// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TextInput,
//     TouchableOpacity,
//     FlatList,
// } from 'react-native';
// import { FIREBASE_DB } from '../../FirebaseConfig';
// import { collection, getDocs } from 'firebase/firestore';

// const CustomizeDisc = () => {
//     const [mold, setMold] = useState('');
//     const [brand, setBrand] = useState('');
//     const [plastic, setPlastic] = useState('');
//     const [color, setColor] = useState('green');

//     const [moldSuggestions, setMoldSuggestions] = useState([]);
//     const [brandSuggestions, setBrandSuggestions] = useState([]);
//     const [plasticSuggestions, setPlasticSuggestions] = useState([]);
//     const [showColorPicker, setShowColorPicker] = useState(false);

//     useEffect(() => {
//         // You can fetch all necessary data for colors here, if needed.
//     }, []);

//     const fetchMolds = useCallback(async (text) => {
//         if (text.length < 2) {
//             setMoldSuggestions([]);
//             return;
//         }
//         const querySnapshot = await getDocs(collection(FIREBASE_DB, 'molds'));
//         const molds = querySnapshot.docs.map((doc) => ({
//             id: doc.id,
//             title: doc.data().name,
//             brand: doc.data().brand,
//         }));
//         setMoldSuggestions(molds.filter((item) => item.title.toLowerCase().startsWith(text.toLowerCase())));
//     }, []);

//     const fetchBrands = useCallback(async (text) => {
//         if (text.length < 2) {
//             setBrandSuggestions([]);
//             return;
//         }
//         const querySnapshot = await getDocs(collection(FIREBASE_DB, 'brands'));
//         const brands = querySnapshot.docs.map((doc) => ({
//             id: doc.id,
//             title: doc.data().name,
//         }));
//         setBrandSuggestions(brands.filter((item) => item.title.toLowerCase().startsWith(text.toLowerCase())));
//     }, []);

//     const fetchPlastics = useCallback(async (text) => {
//         if (text.length < 2) {
//             setPlasticSuggestions([]);
//             return;
//         }
//         const querySnapshot = await getDocs(collection(FIREBASE_DB, 'plastics'));
//         const plastics = querySnapshot.docs.map((doc) => ({
//             id: doc.id,
//             title: doc.data().name,
//         }));
//         setPlasticSuggestions(plastics.filter((item) => item.title.toLowerCase().startsWith(text.toLowerCase())));
//     }, []);

//     const handleMoldSelect = (selectedMold) => {
//         setMold(selectedMold.title);
//         setBrand(selectedMold.brand || '');
//         setMoldSuggestions([]);
//     };

//     const handleBrandSelect = (selectedBrand) => {
//         setBrand(selectedBrand.title);
//         setBrandSuggestions([]);
//     };

//     const handlePlasticSelect = (selectedPlastic) => {
//         setPlastic(selectedPlastic.title);
//         setPlasticSuggestions([]);
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.header}>Customize Disc</Text>

//             {/* Mold Field */}
//             <View style={styles.section}>
//                 <Text style={styles.label}>MOLD</Text>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Enter mold"
//                     value={mold}
//                     onChangeText={(text) => {
//                         setMold(text);
//                         fetchMolds(text);
//                     }}
//                 />
//                 {moldSuggestions.length > 0 && (
//                     <View style={styles.suggestionsContainer}>
//                         {moldSuggestions.map((item) => (
//                             <TouchableOpacity key={item.id} onPress={() => handleMoldSelect(item)}>
//                                 <Text style={styles.suggestionText}>{item.title}</Text>
//                             </TouchableOpacity>
//                         ))}
//                     </View>
//                 )}
//             </View>

//             {/* Brand Field */}
//             <View style={styles.section}>
//                 <Text style={styles.label}>BRAND</Text>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Enter brand"
//                     value={brand}
//                     onChangeText={(text) => {
//                         setBrand(text);
//                         fetchBrands(text);
//                     }}
//                 />
//                 {brandSuggestions.length > 0 && (
//                     <View style={styles.suggestionsContainer}>
//                         {brandSuggestions.map((item) => (
//                             <TouchableOpacity key={item.id} onPress={() => handleBrandSelect(item)}>
//                                 <Text style={styles.suggestionText}>{item.title}</Text>
//                             </TouchableOpacity>
//                         ))}
//                     </View>
//                 )}
//             </View>

//             {/* Plastic Field */}
//             <View style={styles.section}>
//                 <Text style={styles.label}>PLASTIC</Text>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Enter plastic"
//                     value={plastic}
//                     onChangeText={(text) => {
//                         setPlastic(text);
//                         fetchPlastics(text);
//                     }}
//                 />
//                 {plasticSuggestions.length > 0 && (
//                     <View style={styles.suggestionsContainer}>
//                         {plasticSuggestions.map((item) => (
//                             <TouchableOpacity key={item.id} onPress={() => handlePlasticSelect(item)}>
//                                 <Text style={styles.suggestionText}>{item.title}</Text>
//                             </TouchableOpacity>
//                         ))}
//                     </View>
//                 )}
//             </View>

//             {/* Color Picker */}
//             <View style={styles.section}>
//                 <Text style={styles.label}>COLOR</Text>
//                 <View style={[styles.colorCircle, { backgroundColor: color }]} />
//                 <TouchableOpacity style={styles.button} onPress={() => setShowColorPicker(true)}>
//                     <Text style={styles.buttonText}>Update Color</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#1c1c1c', padding: 16 },
//     header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
//     section: { marginBottom: 20 },
//     label: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
//     input: { backgroundColor: '#333', borderRadius: 5, padding: 10, color: '#fff', borderWidth: 1, borderColor: '#555' },
//     suggestionsContainer: { backgroundColor: '#FFF', padding: 5, borderRadius: 5 },
//     suggestionText: { fontSize: 16, padding: 5 },
//     colorCircle: { width: 80, height: 80, borderRadius: 40, marginVertical: 10, alignSelf: 'center' },
//     button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
//     buttonText: { color: '#FFF', fontWeight: 'bold' },
// });

// export default CustomizeDisc;

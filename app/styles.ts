import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8', // Soft light background
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    input: {
        height: 50,
        width: '90%',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#4CAF50', // Green color for an outdoor feel
        backgroundColor: '#ffffff',
        borderRadius: 10, // Rounded corners for a polished look
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    loginHeader: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2E7D32', // Bold green for sports/outdoors
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2, // Space out letters for a modern look
    },
    button: {
        backgroundColor: '#388E3C', // Darker green for strong visibility
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25, // Rounded button for a sleek look
        width: '90%',
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    loadingIndicator: {
        marginVertical: 20,
    },
});
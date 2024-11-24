import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8', // Soft light background
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 200, // Adjust width as needed
        height: 100, // Adjust height as needed
        alignSelf: 'center', // Center the logo horizontally
        marginBottom: 20, // Add spacing below the logo
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
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50', // Use your brand's primary color
        marginBottom: 20,
        textAlign: 'center',
    },
    linkButton: {
        backgroundColor: '#4CAF50', // Use your brand's primary color
        padding: 15,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
        marginVertical: 10,
    },
    linkText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    discInfo: {
        marginVertical: 20,
        alignItems: 'center',
    },
    discText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: '#d9534f', // Red color for cancel
        marginTop: 20,
    },
    table: {
        width: '100%',
        paddingHorizontal: 20,
        marginVertical: 20,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 16,
        color: '#4CAF50',
        textAlign: 'center',
    },
    cell: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    noDiscsText: {
        fontSize: 18,
        color: '#888',
        marginVertical: 20,
        textAlign: 'center',
    },
    selectedRow: {
        backgroundColor: '#388E3C', // Replace with your branded green color
    },
    selectedRowText: {
        color: '#ffffff', // White text for selected row
    },
    trashText: {
        color: 'white',
        marginLeft: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#333',

    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 10,
        // marginBottom: 15,
        width: '90%',
        paddingVertical: Platform.OS === 'ios' ? 12 : 0, // Padding to help display the picker
        backgroundColor: '#ffffff',
        marginVertical: 10,
        color: '#333',

    },
    trashIcon: {
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
    },
    header:{
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2E7D32', // Bold green for sports/outdoors
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    newDiscForm: {
        marginVertical: 20,
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        backgroundColor: '#e9ecef',
      },
      infoText: {
        fontSize: 18,
        color: '#2E7D32',
        fontWeight: '600',
        // textTransform: 'uppercase',
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    actionButton: {
        marginHorizontal: 5,
    },
    watchReviewsText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        padding: 10,
    },
    gridItem: {
        width: '45%', // Wider items that fit two per row
        marginVertical: 10, // Space between rows
        backgroundColor: '#4CAF50',
        paddingVertical: 20, // More padding for better appearance
        borderRadius: 15, // Rounded corners
        alignItems: 'center',
        elevation: 3, // Add shadow on Android
        shadowColor: '#000', // Add shadow on iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    gridItemText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerVid: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2E7D32', // Bold green for sports/outdoors
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    containerVid: {
        flex: 1,
        backgroundColor: '#f0f4f8', // Soft light background
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 1,

    },
    homeButton: {
        backgroundColor: '#1976D2', // Optional blue color for the Home button
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: '100%',
    },
    foundRow: {
        backgroundColor: '#F8D7DA', // Red background for "found" discs
    },
    notifiedRow: {
        backgroundColor: '#DFF0D8', // Light green to indicate "notified" status in store inventory
    },
});
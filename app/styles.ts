// styles.ts
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    // General container
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8', // Light background
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    // Form input fields
    input: {
        height: 50,
        width: '90%',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#4CAF50',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    // Headers for titles
    loginHeader: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    header: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    headerVid: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    // Buttons
    button: {
        backgroundColor: '#388E3C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
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
    homeButton: {
        backgroundColor: '#1976D2',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#d9534f',
        marginTop: 20,
    },
    // Loading indicator
    loadingIndicator: {
        marginVertical: 20,
    },
    // Text styles
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 18,
        color: '#2E7D32',
        fontWeight: '600',
    },
    linkText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    noDiscsText: {
        fontSize: 18,
        color: '#888',
        marginVertical: 20,
        textAlign: 'center',
    },
    // Table and row styling
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
    selectedRow: {
        backgroundColor: '#388E3C',
    },
    selectedRowText: {
        color: '#ffffff',
    },
    // Picker styling for dropdowns
    picker: {
        height: 50,
        width: '100%',
        color: '#333',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 10,
        width: '90%',
        paddingVertical: Platform.OS === 'ios' ? 12 : 0,
        backgroundColor: '#ffffff',
        marginVertical: 10,
        color: '#333',
    },
    // Specific to disc actions in Inventory
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    actionButton: {
        marginHorizontal: 5,
    },
    trashIcon: {
        marginRight: 10,
        color: 'white',
    },
    trashText: {
        color: 'white',
        marginLeft: 10,
    },
    watchReviewsText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    // Disc info for AddDisc
    discInfo: {
        marginVertical: 20,
        alignItems: 'center',
    },
    discText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
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
    // Grid styles for video links in AmateurVideos and ProVideos
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        padding: 10,
    },
    gridItem: {
        width: '45%',
        marginVertical: 10,
        backgroundColor: '#4CAF50',
        paddingVertical: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
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
    containerVid: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 1,
    },
    // Pagination for VideoGrid
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    navButton: {
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
    },
    navText: {
        color: '#ffffff',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    // Button container for multiple buttons in one row
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
    },
});

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ManageMedicationAlert() {
  const [medications, setMedications] = useState([]);
  const [groupedMedications, setGroupedMedications] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const medicationQuery = query(collection(db, 'medicationAlert'));
        const querySnapshot = await getDocs(medicationQuery);
        const medicationList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group medications by userId
        const grouped = medicationList.reduce((acc, medication) => {
          const userId = medication.userId;
          if (!acc[userId]) {
            acc[userId] = [];
          }
          acc[userId].push(medication);
          return acc;
        }, {});
        setGroupedMedications(grouped);
        setMedications(medicationList);
      } catch (error) {
        console.error('Error fetching medications:', error);
      }
    };

    fetchMedications();
  }, []);

  const openModal = (userId) => {
    setSelectedUserId(userId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUserId(null);
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medication Reminders</Text>

      {/* Display user medication reminders once grouped by userId */}
      {Object.keys(groupedMedications).length > 0 ? (
        Object.keys(groupedMedications).map((userId) => {
          const userMedications = groupedMedications[userId];
          const firstMedication = userMedications[0]; // Display only one medication card per user
          return (
            <TouchableOpacity
              key={userId}
              style={styles.medicationCard}
              onPress={() => openModal(userId)}
            >
              <View style={styles.medicationInfo}>
                <Icon name="medkit" size={30} color="#fff" style={styles.medkitIcon} />
                <View>
                  <Text style={styles.medicationName}>{firstMedication.fullName}</Text>
                </View>
              </View>
              <Image
                source={{ uri: firstMedication.userImage || '../../assets/images/default_profile.jpg' }}
                style={styles.userImage}
              />
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={styles.noMedicationsText}>No medications found.</Text>
      )}

      {/* Modal to display all medications of selected user */}
      {selectedUserId && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>All Medication Reminders</Text>
                <Pressable onPress={closeModal}>
                  <Icon name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody}>
                {groupedMedications[selectedUserId].map((medication) => (
                  <View key={medication.id} style={styles.modalCard}>
                    <Text style={styles.modalMedicationText}>
                      <Text style={styles.modalLabel}>Medication Name: </Text>
                      {medication.medicationName}
                    </Text>
                    <Text style={styles.modalMedicationText}>
                      <Text style={styles.modalLabel}>Description: </Text>
                      {medication.description}
                    </Text>
                    <Text style={styles.modalMedicationText}>
                      <Text style={styles.modalLabel}>Duration: </Text>
                      {medication.duration} days
                    </Text>
                    <Text style={styles.modalMedicationText}>
                      <Text style={styles.modalLabel}>Times: </Text>
                      {medication.startTime} - {medication.endTime}
                    </Text>
                    <Text style={styles.modalMedicationText}>
                      <Text style={styles.modalLabel}>Location: </Text>
                      {medication.location}
                    </Text>

                    
                  </View>
                ))}
              </ScrollView>
            </ScrollView>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#32CD32',
    textAlign: 'center',
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: '#32CD32',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medkitIcon: {
    marginRight: 15,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  noMedicationsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#32CD32',
  },
  modalBody: {
    paddingTop: 10,
  },
  modalCard: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalMedicationText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  modalLabel: {
    fontWeight: 'bold',
    color: '#32CD32',
  },

  closeButton: {
    backgroundColor: '#E74C3C', // Red color for the close button
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    elevation: 5,
  },
  
});



{/*
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

export default function ManageMedicationAlert() {
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const medicationQuery = query(
          collection(db, 'medicationAlert'),
        //  where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(medicationQuery);
        const medicationList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedications(medicationList);
      } catch (error) {
        console.error('Error fetching medications:', error);
      }
    };

    fetchMedications();
  }, []);

  const openModal = (medication) => {
    setSelectedMedication(medication);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMedication(null);
  };

  const deleteMedication = async () => {
    if (selectedMedication) {
      try {
        // Deleting the medication from Firestore
        await deleteDoc(doc(db, 'medicationAlert', selectedMedication.id));

        // Remove the deleted medication from the local state
        setMedications(medications.filter((med) => med.id !== selectedMedication.id));

        // Close the modal after deletion
        closeModal();

        Alert.alert('Success', 'Medication deleted successfully');
      } catch (error) {
        console.error('Error deleting medication:', error);
        Alert.alert('Error', 'Failed to delete the medication. Please try again.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medication Reminders</Text>

      {medications.length > 0 ? (
        medications.map((medication) => (
          <TouchableOpacity
            key={medication.id}
            style={styles.medicationCard}
            onPress={() => openModal(medication)}
          >
            <View style={styles.medicationInfo}>
              <Icon name="medkit" size={30} color="#fff" style={styles.medkitIcon} />
              <View>
                <Text style={styles.modalMedicationName}>{medication.fullName}</Text>
                
              </View>
            </View>
            <Image
                source={{ uri: medication.userImage || '../../assets/images/default_profile.jpg' }} style={styles.modalUserImage} />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noMedicationsText}>No medications found.</Text>
      )}

      {selectedMedication && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Medication Details</Text>
                <Pressable onPress={closeModal}>
                  <Icon name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <View style={styles.modalMedicationInfo}>
              <Image
                source={{ uri: selectedMedication.userImage || '../../assets/images/default_profile.jpg' }} style={styles.modalUserImage} />
              <View>
                <Text style={styles.modalMedicationName}>{selectedMedication.fullName}</Text>
                <Text style={styles.modalMedicationTime}>
                  {selectedMedication.location}
                </Text>
              </View>
            </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Medication Name: </Text>
                  {selectedMedication.medicationName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Description: </Text>
                  {selectedMedication.description}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Duration: </Text>
                  {selectedMedication.duration} days
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Times: </Text>
                  {selectedMedication.startTime} - {selectedMedication.endTime}
                </Text>
                <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Created on: </Text>
                    {selectedMedication.createdAt}
                </Text>

                {/* Styled Delete Button 
                <TouchableOpacity style={styles.deleteButton} onPress={deleteMedication}>
                  <Text style={styles.deleteButtonText}>Delete Medication</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2980B9',
    textAlign: 'center',
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: '#2980B9',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medkitIcon: {
    marginRight: 15,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  medicationTime: {
    fontSize: 14,
    color: '#fff',
  },
  noMedicationsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2980B9',
  },
  modalBody: {
    paddingTop: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  modalLabel: {
    fontWeight: 'bold',
    color: '#2980B9',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  modalUserImage: {
    marginRight: 15,
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  modalMedicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  modalMedicationTime: {
    fontSize: 14,
    color: 'black',
  },
  modalMedicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
*/}
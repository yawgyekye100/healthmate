// /screens/admin/ManageAmbulance.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig'; // Import your Firebase configuration

export default function ManageAmbulance() {
  const [ambulanceRequests, setAmbulanceRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchAmbulanceRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ambulanceRequests'));
        const requests = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setAmbulanceRequests(requests);
      } catch (error) {
        console.log('Error fetching ambulance requests:', error);
      }
    };

    fetchAmbulanceRequests();
  }, []);

  const handleUpdateRequest = async (id, status) => {
    try {
      const updatedDate = new Date().toDateString();
      await updateDoc(doc(db, 'ambulanceRequests', id), { status, updatedDate });
      Alert.alert('Success', 'Ambulance request updated successfully');
      setAmbulanceRequests(prev => prev.map(req => req.id === id ? { ...req, status, updatedDate } : req));
    } catch (error) {
      console.log('Error updating ambulance request:', error);
    }
  };

  const handleDeleteRequest = async id => {
    try {
      await deleteDoc(doc(db, 'ambulanceRequests', id));
      Alert.alert('Success', 'Ambulance request deleted successfully');
      setAmbulanceRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.log('Error deleting ambulance request:', error);
    }
  };

  const renderAmbulanceRequests = () => {
    const filteredRequests = ambulanceRequests.filter(req => req.status === activeTab);
    if (filteredRequests.length === 0) {
      return <Text style={styles.noRequestsText}>No {activeTab === 'pending' ? 'Pending' : 'Granted'} Ambulance Requests</Text>;
    }

    return filteredRequests.map(request => (
      <View key={request.id} style={styles.card}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: request.userImage || 'https://static.vecteezy.com/system/resources/thumbnails/036/280/650/small/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg' }} style={styles.userImage} />
          <View style={styles.infoContainer}>
            <Text style={styles.fullName}>{request.fullName}</Text>
            <Text style={styles.location}>{request.email}</Text>
            <Text style={styles.location}>{request.location}</Text>
          </View>
        </View>

        <Text style={styles.label}>Created At:</Text>
        <TextInput style={styles.input} value={request.createdAt} editable={false} />
        
        <Text style={styles.label}>Reason:</Text>
        <TextInput style={styles.input} value={request.reason} editable={false} multiline />

        <Text style={styles.label}>Description:</Text>
        <TextInput style={styles.input} value={request.description} editable={false} multiline />

        <Text style={styles.label}>Allergies:</Text>
        <TextInput style={styles.input} value={request.allergies} editable={false} multiline />

        <Text style={styles.label}>Ambulance Type:</Text>
        <TextInput style={styles.input} value={request.ambulanceType} editable={false} />

        <Text style={styles.label}>Arrival Date:</Text>
        <TextInput style={styles.input} value={request.arrivalDateString} editable={false} />

        <Text style={styles.label}>Arrival Time:</Text>
        <TextInput style={styles.input} value={request.arrivalTime} editable={false} />

        <Text style={styles.label}>Pickup Branch:</Text>
        <TextInput style={styles.input} value={request.branch} editable={false} />

        <Text style={styles.label}>Current Location:</Text>
        <TextInput style={styles.input} value={request.currentLocation} editable={false} />

        <Text style={styles.label}>Medical Condition:</Text>
        <TextInput style={styles.input} value={request.medicalCondition} editable={false} multiline />

        <Text style={styles.label}>Medications:</Text>
        <TextInput style={styles.input} value={request.medications} editable={false} multiline />

        <Text style={styles.label}>Phone Number:</Text>
        <TextInput style={styles.input} value={request.phoneNumber} editable={false} />

        <Text style={styles.label}>Status:</Text>
        <TextInput style={styles.input} value={request.status} editable={false} />

        <Text style={styles.label}>Updated Date:</Text>
        <TextInput style={styles.input} value={request.updatedDate} editable={false} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handleUpdateRequest(request.id, activeTab === 'pending' ? 'granted' : 'pending')}
          >
            <Text style={styles.buttonText}>{activeTab === 'pending' ? 'Grant' : 'Revoke'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteRequest(request.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={styles.tabText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'granted' && styles.activeTab]}
          onPress={() => setActiveTab('granted')}
        >
          <Text style={styles.tabText}>Granted</Text>
        </TouchableOpacity>
      </View>
      {renderAmbulanceRequests()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#32CD32',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },


  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
    fontWeight: 600,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 2,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ddd', // Light border color for the image
  },
  infoContainer: {
    justifyContent: 'center',
  },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#777',
  },


  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noRequestsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
});

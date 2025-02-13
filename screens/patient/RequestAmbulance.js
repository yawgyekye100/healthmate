import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function RequestAmbulance() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [ambulanceType, setAmbulanceType] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || arrivalDate;
    setShowDatePicker(false);
    setArrivalDate(currentDate);
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (user) {

        const arrivalDateString = new Date(arrivalDate).toISOString().split('T')[0];

        const ambulanceRequestData = {
          userId: user.uid,
          fullName: userDetails.fullName,
          email: userDetails.email,
          location: userDetails.location,
          userImage: userDetails.profileImage,
          phoneNumber,
          branch,
          reason,
          description,
          currentLocation: location,
          arrivalDateString,
          arrivalTime,
          medicalCondition,
          medications,
          allergies,
          ambulanceType,
          status: 'pending', // Default status
          createdAt: new Date().toDateString(),
        };

        const ambulanceRequestsRef = collection(db, 'ambulanceRequests');
        const docRef = await addDoc(ambulanceRequestsRef, ambulanceRequestData);
        await setDoc(docRef, { ambulanceRequestId: docRef.id }, { merge: true });

        Alert.alert('Success', 'Your ambulance request has been successfully created.');
     //   navigation.navigate('MedicalRecords');
      }
    } catch (error) {
      Alert.alert('Error', 'There was an issue creating your ambulance request. Please try again later.');
      console.error("Error adding document: ", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request an Ambulance</Text>

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <Text style={styles.label}>Hospital Branch</Text>
      <RNPickerSelect
        style={pickerSelectStyles}
        placeholder={{ label: 'Select a branch', value: null }}
        onValueChange={(value) => setBranch(value)}
        items={[
          { label: 'Accra', value: 'Accra' },
          { label: 'Kumasi', value: 'Kumasi' },
          { label: 'Cape Coast', value: 'Cape Coast' },
        ]}
      />

      <Text style={styles.label}>Reason for Ambulance Request</Text>
      <RNPickerSelect
        style={pickerSelectStyles}
        placeholder={{ label: 'Select reason', value: null }}
        onValueChange={(value) => setReason(value)}
        items={[
          { label: 'Medical Emergency', value: 'Medical Emergency' },
          { label: 'Non-Medical Emergency', value: 'Non-Medical Emergency' },
          { label: 'Other', value: 'Other' },
        ]}
      />

      <Text style={styles.label}>Brief Description of Emergency</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe the emergency"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Current Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your current location"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Date for Ambulance Arrival</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select a date"
          value={arrivalDate.toDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={arrivalDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
        )}

      <Text style={styles.label}>Time for Ambulance Arrival</Text>
      <RNPickerSelect
        style={pickerSelectStyles}
        placeholder={{ label: 'Select time', value: null }}
        onValueChange={(value) => setArrivalTime(value)}
        items={[
          { label: '09:00 AM', value: '09:00 AM' },
          { label: '10:00 AM', value: '10:00 AM' },
          { label: '11:00 AM', value: '11:00 AM' },
          { label: '12:00 PM', value: '12:00 PM' },
          { label: '01:00 PM', value: '01:00 PM' },
        ]}
      />

      <Text style={styles.label}>Current Medical Condition/Diagnosis (if known)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe your medical condition"
        multiline
        numberOfLines={4}
        value={medicalCondition}
        onChangeText={setMedicalCondition}
      />

      <Text style={styles.label}>Medications (if any)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="List any medications you are taking"
        multiline
        numberOfLines={4}
        value={medications}
        onChangeText={setMedications}
      />

      <Text style={styles.label}>Allergies (if any)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="List any allergies"
        multiline
        numberOfLines={4}
        value={allergies}
        onChangeText={setAllergies}
      />

      <Text style={styles.label}>Type of Ambulance Required</Text>
      <RNPickerSelect
        style={pickerSelectStyles}
        placeholder={{ label: 'Select ambulance type', value: null }}
        onValueChange={(value) => setAmbulanceType(value)}
        items={[
          { label: 'Basic', value: 'Basic' },
          { label: 'Advanced Life Support (ALS)', value: 'Advanced Life Support (ALS)' },
          { label: 'Critical Care', value: 'Critical Care' },
          { label: 'Specialty', value: 'Specialty' },
        ]}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#32CD32',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    height: 100,
  },
  button: {
    backgroundColor: '#32CD32',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
};

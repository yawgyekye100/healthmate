import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function BookAppointment() {
  const [contactNumber, setContactNumber] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [branch, setBranch] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
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
    const currentDate = selectedDate || appointmentDate;
    setShowDatePicker(false);
    setAppointmentDate(currentDate);
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const appointmentDateString = new Date(appointmentDate).toISOString().split('T')[0];

        const appointmentData = {
          userId: user.uid,
          fullName: userDetails.fullName,
          email: userDetails.email,
          location: userDetails.location,
          userImage: userDetails.profileImage,
          contactNumber,
          appointmentDateString,
          appointmentTime,
          reason,
          branch,
          currentMedications,
          allergies,
          medicalConditions,
          emergencyContactName,
          emergencyContactPhone,
          status: 'pending', // Default status
          createdAt: new Date().toDateString(),
        };

        const appointmentsRef = collection(db, 'appointments');
        const docRef = await addDoc(appointmentsRef, appointmentData);
        await setDoc(docRef, { appointmentId: docRef.id }, { merge: true });

        Alert.alert('Success', 'Your appointment has been successfully created.');
       // navigation.navigate('MedicalRecords');
      }
    } catch (error) {
      Alert.alert('Error', 'There was an issue creating your appointment. Please try again later.');
      console.error("Error adding document: ", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book an Appointment</Text>

      <Text style={styles.label}>Contact Number (Phone)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your contact number"
        keyboardType="phone-pad"
        value={contactNumber}
        onChangeText={setContactNumber}
      />

      <Text style={styles.label}>Preferred Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select a date"
          value={appointmentDate.toDateString()}
          editable={false}
        />
      </TouchableOpacity>
     {showDatePicker && (
        <DateTimePicker
          value={appointmentDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
        )}

      <Text style={styles.label}>Preferred Time</Text>
      <RNPickerSelect
        style={pickerSelectStyles}
        placeholder={{ label: 'Select time', value: null }}
        onValueChange={(value) => setAppointmentTime(value)}
        items={[
          { label: '09:00 AM', value: '09:00 AM' },
          { label: '10:00 AM', value: '10:00 AM' },
          { label: '11:00 AM', value: '11:00 AM' },
          { label: '12:00 PM', value: '12:00 PM' },
          { label: '01:00 PM', value: '01:00 PM' },
        ]}
      />

      <Text style={styles.label}>Reason for Appointment</Text>
      <TextInput
        style={styles.input}
        placeholder="Brief description of your issue"
        value={reason}
        onChangeText={setReason}
      />

      <Text style={styles.label}>Hospital Branch</Text>
      <RNPickerSelect
        style={pickerSelectStyles}
        placeholder={{ label: 'Select a branch', value: null }}
        onValueChange={(value) => setBranch(value)}
        items={[
          { label: 'Accra', value: 'Accra' },
          { label: 'Kumasi', value: 'Kumasi' },
          { label: 'Capecoast', value: 'Capecoast' },
        ]}
      />

      <Text style={styles.label}>Current Medications (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="List any current medications"
        value={currentMedications}
        onChangeText={setCurrentMedications}
      />

      <Text style={styles.label}>Allergies (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="List any allergies"
        value={allergies}
        onChangeText={setAllergies}
      />

      <Text style={styles.label}>Existing Medical Conditions (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="List any existing medical conditions"
        value={medicalConditions}
        onChangeText={setMedicalConditions}
      />

      <Text style={styles.label}>Emergency Contact Name (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter emergency contact name"
        value={emergencyContactName}
        onChangeText={setEmergencyContactName}
      />

      <Text style={styles.label}>Emergency Contact Phone Number (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter emergency contact phone number"
        keyboardType="phone-pad"
        value={emergencyContactPhone}
        onChangeText={setEmergencyContactPhone}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Appointment Request</Text>
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
    fontWeight: '600',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    color: 'black',
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    color: 'black',
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
});


{/*
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native'; 
// import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import TrackMedication from './TrackMedication';

export default function BookAppointment() {
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [preferredDate, setPreferredDate] = useState(new Date());
  const [preferredTime, setPreferredTime] = useState('');
  const [reasonForAppointment, setReasonForAppointment] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [existingConditions, setExistingConditions] = useState('');
  const [hearAboutUs, setHearAboutUs] = useState('');
 // const [consentTerms, setConsentTerms] = useState(false);
 // const [consentCommunication, setConsentCommunication] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.error('No such user data!');
      }
    };
    fetchUserData();
  }, []);

    const handleSubmit = async () => {
      try {
        const user = auth.currentUser;
        const appointmentRef = await addDoc(collection(db, 'appointments'), {
          userId: user.uid,
          fullName: userData?.fullName || '',
          email: user.email,
          location: userData?.location || '',
          dob: dob.toISOString().split('T')[0],
          gender,
          contactNumber,
          preferredDate: preferredDate.toISOString().split('T')[0],
          preferredTime,
          reasonForAppointment,
          currentMedications,
          allergies,
          existingConditions,
          hearAboutUs,
          emergencyContactName,
          emergencyContactPhone,
          accessibilityNeeds,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
  
        Alert.alert('Success', 'Your appointment has been booked successfully!');
        navigation.replace('MedicalRecords');
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    };
  

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>Patient Information</Text>
      <View style={styles.formGroup}>
        <Text>Date of Birth</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            value={dob.toDateString()}
            editable={false}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDob(selectedDate);
            }}
          />
        )}
      </View>
      <View style={styles.formGroup}>
        <Text>Gender (Optional)</Text>
        <Picker
          selectedValue={gender}
          style={styles.picker}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>
      <View style={styles.formGroup}>
        <Text>Contact Number (Phone)</Text>
        <TextInput
          style={styles.input}
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />
      </View>

      <Text style={styles.heading}>Appointment Details</Text>
      <View style={styles.formGroup}>
        <Text>Preferred Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            value={preferredDate.toDateString()}
            editable={false}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={preferredDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setPreferredDate(selectedDate);
            }}
          />
        )}
      </View>
      <View style={styles.formGroup}>
        <Text>Preferred Time</Text>
        <Picker
          selectedValue={preferredTime}
          style={styles.picker}
          onValueChange={(itemValue) => setPreferredTime(itemValue)}
        >
          <Picker.Item label="Select Time" value="" />
          <Picker.Item label="9:00 AM" value="9:00 AM" />
          <Picker.Item label="10:00 AM" value="10:00 AM" />
          <Picker.Item label="11:00 AM" value="11:00 AM" />
          <Picker.Item label="12:00 PM" value="12:00 PM" />
          <Picker.Item label="1:00 PM" value="1:00 PM" />
          <Picker.Item label="2:00 PM" value="2:00 PM" />
        </Picker>
      </View>
      <View style={styles.formGroup}>
        <Text>Reason for Appointment</Text>
        <TextInput
          style={styles.input}
          value={reasonForAppointment}
          onChangeText={setReasonForAppointment}
          multiline
        />
      </View>

      <Text style={styles.heading}>Additional Information</Text>
      <View style={styles.formGroup}>
        <Text>Current Medications (Optional)</Text>
        <TextInput
          style={styles.input}
          value={currentMedications}
          onChangeText={setCurrentMedications}
          multiline
        />
      </View>
      <View style={styles.formGroup}>
        <Text>Allergies (Optional)</Text>
        <TextInput
          style={styles.input}
          value={allergies}
          onChangeText={setAllergies}
          multiline
        />
      </View>
      <View style={styles.formGroup}>
        <Text>Existing Medical Conditions (Optional)</Text>
        <TextInput
          style={styles.input}
          value={existingConditions}
          onChangeText={setExistingConditions}
          multiline
        />
      </View>
      <View style={styles.formGroup}>
        <Text>How did you hear about us? (Optional)</Text>
        <TextInput
          style={styles.input}
          value={hearAboutUs}
          onChangeText={setHearAboutUs}
        />
      </View>
          

      <Text style={styles.heading}>Emergency Contact (Optional)</Text>
      <View style={styles.formGroup}>
        <Text>Emergency Contact Name</Text>
        <TextInput
          style={styles.input}
          value={emergencyContactName}
          onChangeText={setEmergencyContactName}
        />
      </View>
      <View style={styles.formGroup}>
        <Text>Emergency Contact Phone Number</Text>
        <TextInput
          style={styles.input}
          value={emergencyContactPhone}
          onChangeText={setEmergencyContactPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text>Do you have any accessibility needs or require special accommodations?</Text>
        <Picker
          selectedValue={accessibilityNeeds}
          style={styles.picker}
          onValueChange={(itemValue) => setAccessibilityNeeds(itemValue)}
        >
          <Picker.Item label="No" value="no" />
          <Picker.Item label="Yes" value="yes" />
        </Picker>
        {accessibilityNeeds === 'yes' && (
          <TextInput
            style={styles.input}
            placeholder="Please specify"
            onChangeText={setAccessibilityNeeds}
          />
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Appointment Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingVertical: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

*/}
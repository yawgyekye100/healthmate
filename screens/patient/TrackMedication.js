import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker'; // For time selection
import { useNavigation } from '@react-navigation/native';

export default function TrackMedication() {
  const [medicationName, setMedicationName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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

  const handleSubmit = async () => {
    if (!medicationName || !description || !duration || !startTime || !endTime) {
      alert('Please fill all fields!');
      return;
    }

    try {
      const medicationRef = await addDoc(collection(db, 'medicationAlert'), {
        medicationName,
        description,
        duration,
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
        userId: auth.currentUser.uid,
        fullName: userDetails.fullName,
        email: userDetails.email,
        location: userDetails.location,
        userImage: userDetails.profileImage,
        createdAt: new Date().toDateString(),
      });

      // Update the document with the medicationAlertId
      await updateDoc(doc(db, 'medicationAlert', medicationRef.id), {
        medicationAlertId: medicationRef.id,
      });

      alert('Medication reminder created successfully!');
      navigation.goBack(); // Navigate back after successful submission
    } catch (error) {
      console.error('Error creating medication reminder:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Medication Reminder</Text>

      <View style={styles.inputContainer}>
        <Icon name="medkit" size={24} color="#2980B9" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Medication Name"
          value={medicationName}
          onChangeText={setMedicationName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="pencil" size={24} color="#2980B9" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="calendar" size={24} color="#2980B9" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Duration in Days"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />
      </View>

      <View style={styles.timeContainer}>
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <View style={styles.inputContainer}>
            <Icon name="clock-o" size={24} color="#2980B9" style={styles.icon} />
            <Text style={styles.input}>
              Start Time: {startTime.toLocaleTimeString()}
            </Text>
          </View>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedTime) => {
              setShowStartPicker(false);
              setStartTime(selectedTime || startTime);
            }}
          />
        )}

        <TouchableOpacity onPress={() => setShowEndPicker(true)}>
          <View style={styles.inputContainer}>
            <Icon name="clock-o" size={24} color="#2980B9" style={styles.icon} />
            <Text style={styles.input}>
              End Time: {endTime.toLocaleTimeString()}
            </Text>
          </View>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedTime) => {
              setShowEndPicker(false);
              setEndTime(selectedTime || endTime);
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Reminder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#32CD32',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
    color: '#32CD32',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  timeContainer: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#32CD32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
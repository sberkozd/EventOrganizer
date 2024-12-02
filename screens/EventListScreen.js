import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import AddEventDialog from './AddEventDialog';

const EventListScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchEvents = async () => {
        try {
          console.log('Fetching events from Firestore');
          const eventsCollection = collection(db, 'events');
          const eventsSnapshot = await getDocs(eventsCollection);
          const eventsList = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Fetched events:', eventsList);
          setEvents(eventsList);
        } catch (error) {
          console.error('Error fetching events:', error); 
        }
      };

      fetchEvents();
    }, [])
  );

  const handleAddEvent = async (newEvent) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const eventToAdd = {
          ...newEvent,
          createdByUser: user.uid,
        };
        const docRef = await addDoc(collection(db, 'events'), eventToAdd);
        const addedEvent = { id: docRef.id, ...eventToAdd };
        setEvents([...events, addedEvent]);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDate}>{item.date}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#000" style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      <AddEventDialog
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddEvent={handleAddEvent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 14,
    color: '#888',
  },
  itemDescription: {
    fontSize: 16,
    color: '#555',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventListScreen;
// @refresh reset
import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-community/async-storage'
import { TextInput, View, StyleSheet, TouchableOpacity, Text, YellowBox } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { initializeFirebase } from './firebase-config';
import 'firebase/firestore';

const db = initializeFirebase()

YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const chatsRef = db.collection('chats')

export default function App() {

  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])

  // get user data on first component mount
  useEffect(() => {
    getUserData()
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === 'added')
        .map(({ doc }) => {
          const message = doc.data()
          // message body createdAt at firebase console with timestamp instance
          return { ...message, createdAt: message.createdAt.toDate() }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      addMessages(messagesFirestore)
    })
    return () => unsubscribe()
  }, [])

  // add messages to form like a thread
  const addMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
    },
    [messages]
  )

  // get user data from localstotage
  async function getUserData() {
    const user = await AsyncStorage.getItem('user')
    if (user) {
      setUser(JSON.parse(user))
    }
  }

  // login handler to set a unique user and add to localstorage
  async function onLogin() {
    const _id = Math.random().toString(36).substring(7)
    const user = { _id, name };
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  // onSend handler to send messages
  async function handleSend(messages) {
    const writes = messages.map((m) => chatsRef.add(m))
    await Promise.all(writes)
  }


  if (user) {
    return (
      <GiftedChat messages={messages} user={user} onSend={handleSend} />
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Login Here</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={'Username'}
        style={styles.input}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={onLogin}
      >
        <Text>Press Here</Text>
      </TouchableOpacity>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  input: {
    width: 350,
    padding: 12,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'lightblue',
    padding: 10,
    width: 300,
  },
  titleText: {
    fontSize: 30
  }
});


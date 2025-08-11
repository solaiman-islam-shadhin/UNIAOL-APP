// /app/toastConfig.js (or any other path)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const toastConfig = {
  /*
    Overwrite the default success toast
  */
  success: ({ text1, props }) => (
    <View style={styles.successContainer}>
      <Text style={styles.successText}>✅ {text1}</Text>
    </View>
  ),

};

// --- Add your styles ---
const styles = StyleSheet.create({
  successContainer: {
    height: 60,
    width: '90%',
    backgroundColor: '#ff8353', // A nice green
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
 
});
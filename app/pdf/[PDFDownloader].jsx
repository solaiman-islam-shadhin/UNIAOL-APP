import React, { useState } from 'react';
import { Button, View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const PDFDownloaderAndSharer = () => {
  const [isWorking, setIsWorking] = useState(false);

  const downloadAndShare = async () => {
    setIsWorking(true);

    const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const fileName = `class-notes-${Date.now()}.pdf`;
    const localUri = FileSystem.cacheDirectory + fileName;

    try {
     
      await FileSystem.downloadAsync(pdfUrl, localUri);
     
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing isn't available on your device");
        return;
      }
      await Sharing.shareAsync(localUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or share your class notes',
      });

    } catch (error) {
    
      Alert.alert(error, 'An unexpected error occurred while handling the file.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <View  className='mt-14 ' style={styles.container}>
      {isWorking ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Preparing File...</Text>
        </View>
      ) : (

        <TouchableOpacity className=' w-2/3 py-4 px-2 rounded-full bg-[#151527] text-center ' onPress={downloadAndShare}
          disabled={isWorking}>
          <Text style={styles.Btn_text} className='text-center text-[#ff8353]' >
            Download Class Notes
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingContainer: { alignItems: 'center' },
  Btn_text: { fontFamily: 'JosefinSans-SemiBold' },
});

export default PDFDownloaderAndSharer;
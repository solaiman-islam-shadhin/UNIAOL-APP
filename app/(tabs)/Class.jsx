import { View, Text, StatusBar, FlatList, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import CourseData from '../../store/CourseData';
import { useState } from 'react';
import { ScrollView } from 'react-native-virtualized-view';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';



const Class = () => {
  
  return (
    <SafeAreaView contentContainerStyle={{ height: '100%', }}>
      <LinearGradient className='flex justify-center items-center bg-[#151527] h-full px-3 ' colors={['#151527','#0e1636', '#ff8353','#000000','transparent']} start={{ x: 0.8, y: 0.2 }} end={{ x: 1.9, y: 0.6 }} >
        <StatusBar style={"dark-content"} className='bg-[#151527]'></StatusBar>
        <Text style={styles.Home_text} className='flex justify-center items-center'> Update will coming soon......</Text>
      </LinearGradient>
</SafeAreaView>
  )
}
const styles = StyleSheet.create({
  Home_text: {
    fontSize: 22,
    fontFamily: 'Michroma-Regular',
    padding: 2,
    color: "white",

  },
  Btn_text: {
    fontFamily: 'JosefinSans-SemiBold',
  }
});
export default Class;
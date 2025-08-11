import { View, Text, Image, StatusBar, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import CourseData from '../../store/CourseData'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { ScrollView } from 'react-native'
import { useCart } from '../context/CartContext'
import Toast from 'react-native-toast-message';


const router = useRouter()
export default function ViewDetails() {
  const { items, addToCart } = useCart();

  const { ViewDetails } = useLocalSearchParams()
  const data = CourseData.find((item) => item.id.toString() == ViewDetails)
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLines = 10;
  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };
  const showSuccessToast = () => {
    Toast.show({
      type: 'success',
      text1: 'Hello 👋',
      text2: 'This is a success toast message!'
    });
  }
  const isInCart = items.some(item => item.id === data.id);
  const handlePress = () => {
    if (!isInCart) {
      addToCart(data);
        Toast.show({
      type: 'success',
      text1: 'Item added Successfully!'
    });
    return;
    }

  }



  const styles = StyleSheet.create({
    Btn_text: {
      fontFamily: 'JosefinSans-SemiBold',
    }
  });
  return (
    <SafeAreaView contentContainerStyle={{ height: '100%' }}>
      <LinearGradient className='bg-[#151527] px-4 h-full' colors={['#151527', '#ff8353', 'transparent']} start={{ x: 1, y: 0.3 }} end={{ x: 1.8, y: 0.5 }} >
        <StatusBar style={"dark-content"} className='bg-[#151527]'></StatusBar>
        <Animated.View entering={FadeInRight.delay(200).duration(1000).springify()} className='mb-4'>
          <Text style={styles.Btn_text} className='text-3xl text-center mt-5 text-[#ff8353]'>
            {data.course_name}
          </Text>
          <Text style={styles.Btn_text} className='text-4xl w-auto mx-auto text-center rounded-xl mt-3 border-2 border-[#ff8353] p-3 text-[#ff8353]'>
            Price : {data.price} tk
          </Text>
        </Animated.View>
        <ScrollView>

          <Animated.View entering={FadeInUp.delay(300).duration(1000).springify()} >
            <View className='w-full p-4 border-b-2 border-[#ff8353] rounded-xl overflow-hidden bg-transparent mt-5 mb-10 '>
              <BlurView intensity={10} tint="light" className='absolute right-0 top-0 left-0 bottom-0' />
              <Image source={{ uri: data.image }} className="rounded-md  border-t-2 border-[#ff8353] mb-2 w-full h-44" />
              <View className='mt-2' >
                <Text className='text-white font-semibold  text-lg border-t-2 border-spacing-y-3 border-dotted border-[#ff8353] '><Text style={styles.Btn_text} className='text-[#ff8353] mt-2' >Course Name : </Text>{data.course_name}</Text>
                <Text className='text-white font-semibold  text-lg'><Text style={styles.Btn_text} className='text-[#ff8353] mt-2' >Course Code : </Text>{data.course_code}</Text>
                <Text className='text-white font-semibold  text-lg'><Text style={styles.Btn_text} className='text-[#ff8353] mt-2' >Faculty : </Text>{data.faculty}</Text>
                <Text className='text-white font-semibold  text-lg'><Text style={styles.Btn_text} className='text-[#ff8353] mt-2' >Department : </Text>{data.department}</Text>
                <Text className='text-white font-semibold  text-lg'><Text style={styles.Btn_text} className='text-[#ff8353] mt-2' >Class Duration : </Text>{data.class_time} hr</Text>
                <Text className='text-white font-semibold  text-lg'><Text style={styles.Btn_text} className='text-[#ff8353] mt-2' >Sold Course : </Text>{data.sold_course}</Text>
                <Text numberOfLines={isExpanded ? undefined : maxLines} className='text-white font-semibold text-justify text-lg'><Text style={styles.Btn_text} className='text-[#ff8353] mt-2'>Description : </Text>{data.description}</Text>
                <Text className='text-[#ff8353] mt-2' onPress={toggleText}>
                  {isExpanded ? 'Read less' : 'Read more...'}
                </Text>
              </View>
              <View className='flex-row justify-between items-center gap-4 mt-4' >
              
                {isInCart ?
                  <TouchableOpacity onPress={() => router.push('Cart')} className="border-2 border-[#ff8353]  py-3 px-5 mt-3 rounded-xl">
                    <Text className=' text-center  font-semibold text-[#ff8353]' >
                      View Cart
                    </Text>
                  </TouchableOpacity> :
                  <TouchableOpacity onPress={handlePress} className=" border-2 border-[#ff8353] py-3 px-5 mt-3 rounded-xl">
                    <Text className='text-center font-semibold text-[#ff8353]' >
                      Add to Cart
                    </Text>
                  </TouchableOpacity>}
                <TouchableOpacity className=" border-2 border-white py-3 px-5 mt-3 rounded-xl">
                  <Text className='text-center text-white font-semibold'>
                    Buy Now
                  </Text>
                </TouchableOpacity>

              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView >
  )

}
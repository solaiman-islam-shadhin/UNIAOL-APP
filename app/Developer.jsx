import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import solaiman from '../assets/images/solaiman.jpeg'
import sabekun from '../assets/images/sabekun.png'
import parvez from '../assets/images/parvez.jpeg'
import tanvir from '../assets/images/tanvir.jpg'
// --- Developer Data ---
const developers = [
    {
        id: '1',
        name: 'Md Solaiman Islam Shadhin',
        description: 'Lead React Native and React JS developer specializing in UI/UX and full stack Mobile app and Web development',
        image: solaiman,
    },
    {
        id: '2',
        name: 'Sabekun Nahar Chowdhury',
        description: 'Lead UI/UX designer.',
        image: sabekun,
    },
    {
        id: '3',
        name: 'Md Mahamud Hasan',
        description: 'Firebase specialist and developer.',
       image: parvez,
    },
    {
        id: '4',
        name: 'Md Tanvir Alam',
        description: 'UI/UX designer and front-end developer.',
       image: tanvir,
    },
];

export default function Developer() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1">
             <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient className='flex-1 px-4' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className='mt-2 '>
                    <View className="flex-row items-center gap-3 mb-5 ">
                        <TouchableOpacity className='' onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={30} color="#ff8353" />
                        </TouchableOpacity>
                        <Text style={styles.header} className="text-[#ff8353]">Our Team</Text>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        {developers.map((dev, index) => (
                            <Animated.View key={dev.id} entering={FadeInUp.delay(index * 150).duration(600).springify()}>
                                <View className="w-full bg-white/10 rounded-xl border border-white/20 p-4 mb-6 flex-row items-center">
                                    <Image
                                        source={dev.image}
                                        className="w-24 h-24 rounded-full border-2 border-[#ff8353]"
                                    />
                                    <View className="flex-1 ml-4">
                                        <Text style={styles.name} className="text-white">{dev.name}</Text>
                                        <Text style={styles.description} className="text-white/80 mt-1">{dev.description}</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </View>
        <TouchableOpacity
          onPress={() => router.push('Chatbot')}
          className="relative  "
        >
          <Ionicons className='absolute  flex-1 top-24 right-2 bg-[#151527] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
        </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 32,
        fontFamily: 'Cinzel-Bold',
    },
    name: {
        fontSize: 18,
        fontFamily: 'NataSans-Bold',
    },
    description: {
        fontSize: 12,
        fontFamily: 'NataSans-Regular',
        textAlign: 'justify',
    },
});

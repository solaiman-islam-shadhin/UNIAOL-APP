import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
// --- Developer Data ---
const developers = [
    {
        id: '1',
        name: 'Md Solaiman Islam Shadhin',
        description: 'Lead React Native and React JS developer specializing in UI/UX and full stack Mobile app and Web development',
        image: 'https://scontent-sin6-2.xx.fbcdn.net/v/t39.30808-6/491932379_2144108269387914_8599008879674339284_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHlIJdXTkU1M70uY0mMwv9vLkPMDAqo2WwuQ8wMCqjZbJbSWEwzHX7bX5tVTbv-W8BmbwHpps4jxHfkP_nQMle_&_nc_ohc=ajGhvBXsoaMQ7kNvwHk5Jfy&_nc_oc=AdmV-72yH17yF_Tf5D-8nvVCwOK_PATYQcXAhdpk4w2INCAG8f1-kKpJ4_a519Ora4DzkNgBhDRBtB69O6Mi_GYL&_nc_zt=23&_nc_ht=scontent-sin6-2.xx&_nc_gid=cmfyIJhy-m9gt9mPE5aAyA&oh=00_AfU6bxsDSoVPIm9UZH6mQuYFk1UqEk_BYYdRMCIOAz2QLA&oe=68A3B9E2',
    },
    {
        id: '2',
        name: 'Sabekun Nahar Chowdhury',
        description: 'Lead UI/UX designer.',
        image: 'https://img.freepik.com/premium-vector/ui-ux-programmer-flat-design-vector-illustration-business-information-team-sharing-ideas-with-designer-coding-interface-software-app-development_2175-1843.jpg',
    },
    {
        id: '3',
        name: 'Md Mahamud Hasan',
        description: 'Firebase specialist and developer.',
        image: 'https://media-sin11-1.cdn.whatsapp.net/v/t61.24694-24/363035589_6401489473294078_4682999899759549692_n.jpg?ccb=11-4&oh=01_Q5Aa2QGScx7e-D9myD0soOkmx5h5bY43I5UHXyc1JHYkJoGSMg&oe=68AB0FA4&_nc_sid=5e03e0&_nc_cat=104',
    },
    {
        id: '4',
        name: 'Md Tanvir Alam',
        description: 'UI/UX designer and front-end developer.',
        image: 'https://media-sin2-1.cdn.whatsapp.net/v/t61.24694-24/315763494_545296157028687_2937590678254268355_n.jpg?ccb=11-4&oh=01_Q5Aa2QFHmT5Lau05ta3V4t3Zgx5ASKX0Hc2bGdFEBTNReFF4PA&oe=68AB1DBD&_nc_sid=5e03e0&_nc_cat=100',
    },
];

export default function Developer() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1">
             <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient className='flex-1 px-4' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className='mt-10 '>
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
                                        source={{ uri: dev.image }}
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
          <Ionicons className='absolute  right-1 bg-[#151527] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
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

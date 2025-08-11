import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import TabBar from '../../components/TabBar';

const _layout = () => {
    return (
        <Tabs tabBar={props =><TabBar {...props}/>} screenOptions={{
            headerShown: false
            
          
        }}>
            <Tabs.Screen name="Home" options={{
                title: "Home",
                //  tabBarIcon: ({ color }) => (
                //     <FontAwesome5 name="home" size={20} color={color} />)
            }} />
            <Tabs.Screen name="Class" options={{
                title: "My-Classes", 
                // tabBarIcon: ({ color }) => (
                //    <Entypo name="folder-video" size={24} color={color} />)
            }} />
            <Tabs.Screen name="Cart" options={{
                title: "Cart",
                //  tabBarIcon: ({ color }) => (
                //     <Ionicons name="cart" size={20} color={color} />)
            }} />

            <Tabs.Screen name="Profile" options={{
                title: "Profile", 
                // tabBarIcon: ({ color }) => (
                //     <Ionicons name="person-sharp" size={20} color={color} />)
            }} />

        </Tabs>

    )
}

export default _layout
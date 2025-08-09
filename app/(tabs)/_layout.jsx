import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

const _layout = () => {
    return (
        <Tabs screenOptions={{
            headerShown: false, tabBarStyle: { backgroundColor: "#ff8353", height: 60 }, tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
            tabBarActiveTintColor: "white",
            tabBarInactiveTintColor: "#34344f"
        }}>
            <Tabs.Screen name="Home" options={{
                title: "Home", tabBarIcon: ({ color }) => (
                    <FontAwesome5 name="home" size={20} color={color} />)
            }} />
            <Tabs.Screen name="Class" options={{
                title: "My-Class", tabBarIcon: ({ color }) => (
                   <Entypo name="folder-video" size={24} color={color} />)
            }} />
            <Tabs.Screen name="Cart" options={{
                title: "Cart", tabBarIcon: ({ color }) => (
                    <Ionicons name="cart" size={20} color={color} />)
            }} />

            <Tabs.Screen name="Profile" options={{
                title: "Profile", tabBarIcon: ({ color }) => (
                    <Ionicons name="person-sharp" size={20} color={color} />)
            }} />

        </Tabs>

    )
}

export default _layout
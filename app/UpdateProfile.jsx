import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/FireBAseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function UpdateProfile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        imageUrl: '',
        address: '',
        gender: '',
        university: '',
        department: '',
        semester: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUser(userData);
                    // Pre-fill form with existing data
                    setFormData({
                        firstName: userData.name ? userData.name.split(' ')[0] : '',
                        lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
                        imageUrl: userData.imageUrl || '',
                        address: userData.address || '',
                        gender: userData.gender || '',
                        university: userData.university || '',
                        department: userData.department || '',
                        semester: userData.semester || '',
                    });
                }
            } else {
                // If no user, redirect to profile page
                router.replace('/Profile');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateProfile = async () => {
        if (!auth.currentUser) return;

        setLoading(true);
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                imageUrl: formData.imageUrl,
                address: formData.address,
                gender: formData.gender,
                university: formData.university,
                department: formData.department,
                semester: formData.semester,
            });

            Alert.alert("Success", "Your profile has been updated successfully.");
            router.back();

        } catch (error) {
            Alert.alert("Update Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            Alert.alert("Error", "Please fill in all password fields.");
            return;
        }

        setLoading(true);
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);

        try {
            // Re-authenticate the user before changing the password for security
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passwordData.newPassword);
            Alert.alert("Success", "Password updated successfully.");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear fields
        } catch (error) {
            Alert.alert("Password Change Failed", "Please check your current password and try again.");
        } finally {
            setLoading(false);
        }
    };


    if (loading && !user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151527' }}>
                <ActivityIndicator size="large" color="#ff8353" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient style={{ flex: 1 }} colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#ff8353" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Update Profile</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={styles.container}>
                    {/* Profile Details Form */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="First Name" value={formData.firstName} onChangeText={(val) => handleInputChange('firstName', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Last Name" value={formData.lastName} onChangeText={(val) => handleInputChange('lastName', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Profile Image URL" value={formData.imageUrl} onChangeText={(val) => handleInputChange('imageUrl', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Address" value={formData.address} onChangeText={(val) => handleInputChange('address', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Gender" value={formData.gender} onChangeText={(val) => handleInputChange('gender', val)} />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Academic Details</Text>
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="University Name" value={formData.university} onChangeText={(val) => handleInputChange('university', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Department" value={formData.department} onChangeText={(val) => handleInputChange('department', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Semester" value={formData.semester} onChangeText={(val) => handleInputChange('semester', val)} />
                    </View>

                    <TouchableOpacity onPress={handleUpdateProfile} style={styles.button} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile Changes</Text>}
                    </TouchableOpacity>

                    {/* Password Change Form */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Change Password</Text>
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Current Password" secureTextEntry value={passwordData.currentPassword} onChangeText={(val) => handlePasswordChange('currentPassword', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="New Password" secureTextEntry value={passwordData.newPassword} onChangeText={(val) => handlePasswordChange('newPassword', val)} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Confirm New Password" secureTextEntry value={passwordData.confirmPassword} onChangeText={(val) => handlePasswordChange('confirmPassword', val)} />
                    </View>

                    <TouchableOpacity onPress={handleChangePassword} style={[styles.button, { backgroundColor: '#8e5d4c' }]} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    header: {
        fontSize: 30,
        fontFamily: 'Cinzel-Bold',
        color: '#ff8353',
        textAlign: 'center',
    },
    formSection: {
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'NataSans-SemiBold',
        color: 'white',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ff8353',
        paddingBottom: 5,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: 'white',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        fontFamily: 'NataSans-Regular',
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#ff8353',
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'NataSans-SemiBold',
    }
});
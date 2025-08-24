import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, StatusBar, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/FireBAseConfig'; // Keep this for user data
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// --- IMPORTS FOR SUPABASE & IMAGE UPLOAD ---
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../config/SupabaseConfig'; // Import your new Supabase client

// --- IMPORTS FOR ANIMATIONS ---
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

export default function UpdateProfile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', address: '', gender: '', university: '', department: '', semester: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });
    const [imageUri, setImageUri] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);

    const [secureText, setSecureText] = useState({
        current: true, new: true, confirm: true,
    });

    // --- ANIMATION VALUES ---
    // Header Animation
    const headerOpacity = useSharedValue(0);
    const headerTranslateY = useSharedValue(-30);
    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerTranslateY.value }],
    }));

    // Image Picker Animation
    const imagePickerOpacity = useSharedValue(0);
    const imagePickerTranslateY = useSharedValue(30);
    const imagePickerStyle = useAnimatedStyle(() => ({
        opacity: imagePickerOpacity.value,
        transform: [{ translateY: imagePickerTranslateY.value }],
    }));

    // Personal Details Animation
    const personalDetailsOpacity = useSharedValue(0);
    const personalDetailsTranslateY = useSharedValue(30);
    const personalDetailsStyle = useAnimatedStyle(() => ({
        opacity: personalDetailsOpacity.value,
        transform: [{ translateY: personalDetailsTranslateY.value }],
    }));
    
    // Academic Details Animation
    const academicDetailsOpacity = useSharedValue(0);
    const academicDetailsTranslateY = useSharedValue(30);
    const academicDetailsStyle = useAnimatedStyle(() => ({
        opacity: academicDetailsOpacity.value,
        transform: [{ translateY: academicDetailsTranslateY.value }],
    }));

    // Save Button Animation
    const saveButtonOpacity = useSharedValue(0);
    const saveButtonTranslateY = useSharedValue(30);
    const saveButtonStyle = useAnimatedStyle(() => ({
        opacity: saveButtonOpacity.value,
        transform: [{ translateY: saveButtonTranslateY.value }],
    }));
    
    // Password Form Animation
    const passwordFormOpacity = useSharedValue(0);
    const passwordFormTranslateY = useSharedValue(30);
    const passwordFormStyle = useAnimatedStyle(() => ({
        opacity: passwordFormOpacity.value,
        transform: [{ translateY: passwordFormTranslateY.value }],
    }));
    
    // Update Password Button Animation
    const updatePasswordButtonOpacity = useSharedValue(0);
    const updatePasswordButtonTranslateY = useSharedValue(30);
    const updatePasswordButtonStyle = useAnimatedStyle(() => ({
        opacity: updatePasswordButtonOpacity.value,
        transform: [{ translateY: updatePasswordButtonTranslateY.value }],
    }));


    useEffect(() => {
        // Trigger all animations with a stagger
        headerOpacity.value = withTiming(1, { duration: 500 });
        headerTranslateY.value = withTiming(0, { duration: 500 });

        imagePickerOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
        imagePickerTranslateY.value = withDelay(100, withTiming(0, { duration: 500 }));

        personalDetailsOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
        personalDetailsTranslateY.value = withDelay(200, withTiming(0, { duration: 500 }));
        
        academicDetailsOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
        academicDetailsTranslateY.value = withDelay(300, withTiming(0, { duration: 500 }));

        saveButtonOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
        saveButtonTranslateY.value = withDelay(400, withTiming(0, { duration: 500 }));
        
        passwordFormOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
        passwordFormTranslateY.value = withDelay(500, withTiming(0, { duration: 500 }));
        
        updatePasswordButtonOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
        updatePasswordButtonTranslateY.value = withDelay(600, withTiming(0, { duration: 500 }));

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUser(userData);
                    setFormData({
                        firstName: userData.name ? userData.name.split(' ')[0] : '',
                        lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
                        address: userData.address || '',
                        gender: userData.gender || '',
                        university: userData.university || '',
                        department: userData.department || '',
                        semester: userData.semester || '',
                    });
                }
            } else {
                router.replace('/Profile');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64);
        }
    };

    const handleUpdateProfile = async () => {
        if (!auth.currentUser) return;
        setIsSaving(true);
        try {
            let imageUrlToSave = user.imageUrl || '';
            if (imageBase64) {
                const arrayBuffer = decode(imageBase64);
                const filePath = `public/${auth.currentUser.uid}.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('PROFILE-IMAGES')
                    .upload(filePath, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('PROFILE-IMAGES').getPublicUrl(filePath);
                imageUrlToSave = `${urlData.publicUrl}?t=${new Date().getTime()}`;
            }
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                imageUrl: imageUrlToSave,
                address: formData.address,
                gender: formData.gender,
                university: formData.university,
                department: formData.department,
                semester: formData.semester,
            });
            Alert.alert("Success", "Your profile has been updated.");
            router.back();
        } catch (error) {
            Alert.alert("Update Failed", error.message);
        } finally {
            setIsSaving(false);
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
        setIsSaving(true);
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passwordData.newPassword);
            Alert.alert("Success", "Password updated successfully.");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            Alert.alert("Password Change Failed", "Please check your current password and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSecureText = (field) => {
        setSecureText(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#ff8353" /></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient style={{ flex: 1 }} colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <Animated.View style={headerStyle}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={30} color="#ff8353" /></TouchableOpacity>
                        <Text style={styles.header}>Update Profile</Text>
                      
                    </View>
                </Animated.View>
                <ScrollView className='p-4'>
                    <Animated.View style={imagePickerStyle}>
                        <View style={styles.imagePickerContainer}>
                            <Image source={{ uri: imageUri || user?.imageUrl || 'https://placehold.co/120x120/2c2c2c/ff8353?text=Photo' }} style={styles.avatar} />
                            <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick}><Text style={styles.imagePickerText}>Change Photo</Text></TouchableOpacity>
                        </View>
                    </Animated.View>
                    <Animated.View style={personalDetailsStyle}>
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Personal Details</Text>
                            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="First Name" value={formData.firstName} onChangeText={(val) => setFormData(p => ({ ...p, firstName: val }))} />
                            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Last Name" value={formData.lastName} onChangeText={(val) => setFormData(p => ({ ...p, lastName: val }))} />
                            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Address" value={formData.address} onChangeText={(val) => setFormData(p => ({ ...p, address: val }))} />
                            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Gender" value={formData.gender} onChangeText={(val) => setFormData(p => ({ ...p, gender: val }))} />
                        </View>
                    </Animated.View>
                    <Animated.View style={academicDetailsStyle}>
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Academic Details</Text>
                            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="University Name" value={formData.university} onChangeText={(val) => setFormData(p => ({ ...p, university: val }))} />
                            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Department" value={formData.department} onChangeText={(val) => setFormData(p => ({ ...p, department: val }))} />
                            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Semester" value={formData.semester} onChangeText={(val) => setFormData(p => ({ ...p, semester: val }))} />
                        </View>
                    </Animated.View>
                    <Animated.View style={saveButtonStyle}>
                        <TouchableOpacity onPress={handleUpdateProfile} style={styles.button} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile Changes</Text>}
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={passwordFormStyle}>
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Change Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput style={styles.passwordInput} placeholderTextColor="#999" placeholder="Current Password" secureTextEntry={secureText.current} value={passwordData.currentPassword} onChangeText={(val) => setPasswordData(p => ({ ...p, currentPassword: val }))} />
                                <TouchableOpacity onPress={() => toggleSecureText('current')}><Ionicons name={secureText.current ? "eye-off" : "eye"} size={24} color="#999" /></TouchableOpacity>
                            </View>
                            <View style={styles.passwordContainer}>
                                <TextInput style={styles.passwordInput} placeholderTextColor="#999" placeholder="New Password" secureTextEntry={secureText.new} value={passwordData.newPassword} onChangeText={(val) => setPasswordData(p => ({ ...p, newPassword: val }))} />
                                <TouchableOpacity onPress={() => toggleSecureText('new')}><Ionicons name={secureText.new ? "eye-off" : "eye"} size={24} color="#999" /></TouchableOpacity>
                            </View>
                            <View style={styles.passwordContainer}>
                                <TextInput style={styles.passwordInput} placeholderTextColor="#999" placeholder="Confirm New Password" secureTextEntry={secureText.confirm} value={passwordData.confirmPassword} onChangeText={(val) => setPasswordData(p => ({ ...p, confirmPassword: val }))} />
                                <TouchableOpacity onPress={() => toggleSecureText('confirm')}><Ionicons name={secureText.confirm ? "eye-off" : "eye"} size={24} color="#999" /></TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                    <Animated.View style={updatePasswordButtonStyle}>
                        <TouchableOpacity onPress={handleChangePassword} style={[styles.button, { backgroundColor: '#8e5d4c' }]} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'centere',gap:10, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    header: { fontSize: 32, fontFamily: 'Cinzel-Bold', color: '#ff8353', textAlign: 'center' },
    formSection: { marginBottom: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
    sectionTitle: { fontSize: 20, fontFamily: 'NataSans-SemiBold', color: 'white', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ff8353', paddingBottom: 5 },
    input: { backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, fontFamily: 'NataSans-Regular', marginBottom: 12 },
    button: { backgroundColor: '#ff8353', padding: 15, borderRadius: 50, alignItems: 'center', marginTop: 10, marginBottom: 30 },
    buttonText: { color: 'white', fontSize: 18, fontFamily: 'NataSans-SemiBold' },
    imagePickerContainer: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#ff8353', backgroundColor: '#333' },
    imagePickerButton: { marginTop: 15, backgroundColor: 'rgba(255, 131, 83, 0.2)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
    imagePickerText: { color: '#ff8353', fontFamily: 'NataSans-SemiBold', fontSize: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151527' },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1,
        color: 'white',
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'NataSans-Regular',
    },
});

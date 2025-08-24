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

    // --- NEW: State for password visibility ---
    const [secureText, setSecureText] = useState({
        current: true,
        new: true,
        confirm: true,
    });

    useEffect(() => {
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
                    .from('profile-images')
                    .upload(filePath, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(filePath);
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

    // --- NEW: Function to toggle password visibility ---
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
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#ff8353" /></TouchableOpacity>
                    <Text style={styles.header}>Update Profile</Text>
                    <View style={{ width: 28 }} />
                </View>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.imagePickerContainer}>
                        <Image source={{ uri: imageUri || user?.imageUrl || 'https://placehold.co/120x120/2c2c2c/ff8353?text=Photo' }} style={styles.avatar} />
                        <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick}><Text style={styles.imagePickerText}>Change Photo</Text></TouchableOpacity>
                    </View>
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="First Name" value={formData.firstName} onChangeText={(val) => setFormData(p => ({ ...p, firstName: val }))} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Last Name" value={formData.lastName} onChangeText={(val) => setFormData(p => ({ ...p, lastName: val }))} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Address" value={formData.address} onChangeText={(val) => setFormData(p => ({ ...p, address: val }))} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Gender" value={formData.gender} onChangeText={(val) => setFormData(p => ({ ...p, gender: val }))} />
                    </View>
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Academic Details</Text>
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="University Name" value={formData.university} onChangeText={(val) => setFormData(p => ({ ...p, university: val }))} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Department" value={formData.department} onChangeText={(val) => setFormData(p => ({ ...p, department: val }))} />
                        <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Semester" value={formData.semester} onChangeText={(val) => setFormData(p => ({ ...p, semester: val }))} />
                    </View>
                    <TouchableOpacity onPress={handleUpdateProfile} style={styles.button} disabled={isSaving}>
                        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile Changes</Text>}
                    </TouchableOpacity>
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Change Password</Text>
                        {/* --- MODIFIED: Password fields with visibility toggle --- */}
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
                    <TouchableOpacity onPress={handleChangePassword} style={[styles.button, { backgroundColor: '#8e5d4c' }]} disabled={isSaving}>
                        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... (all previous styles are the same)
    container: { padding: 20 },
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    header: { fontSize: 28, fontFamily: 'Cinzel-Bold', color: '#ff8353', textAlign: 'center' },
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
    
    // --- NEW: Styles for password input with icon ---
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

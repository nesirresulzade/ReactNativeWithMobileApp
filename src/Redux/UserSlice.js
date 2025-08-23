import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================
// SIGNUP
// ==========================
export const signupUser = createAsyncThunk(
    'user/signupUser',
    async ({ name, email, password }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Firebase Auth-da user-ın displayName-ini yenilə
            try {
                await updateProfile(userCredential.user, {
                    displayName: name
                });
            } catch (profileError) {
                console.log('Profile update error (non-critical):', profileError);
            }
            
            // User məlumatlarını yarat və name sahəsini əlavə et
            const userData = {
                email: userCredential.user.email,
                uid: userCredential.user.uid,
                name: name, // Name sahəsini əlavə et
                displayName: name, // Firebase displayName də əlavə et
                photoURL: userCredential.user.photoURL || null,
            };

            // AsyncStorage-də saxla
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            // Firebase-də user-ə aid collection-ları yarat
            try {
                // User document yarat
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: userData.email,
                    name: userData.name,
                    createdAt: new Date().toISOString(), // Date-i string-ə çevir
                });
                
                // User-ə aid tasks collection yarat (placeholder olmadan)
                // Yalnız real notlar əlavə edildikdə collection yaradılacaq
                
                // User-ə aid history collection yarat (placeholder olmadan)
                // Yalnız real history məlumatları əlavə edildikdə collection yaradılacaq
                
                console.log('User document created successfully');
            } catch (collectionError) {
                console.log('Collection creation error (non-critical):', collectionError);
                // Collection yaradılmasa da user qeydiyyatı uğurlu sayılır
            }
            
            return userData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
);

// ==========================
// LOGIN
// ==========================
export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ email, password }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Firebase-dən user məlumatlarını al
            let userData;
            
            try {
                // Firestore-dan user məlumatlarını yoxla
                const userDocRef = doc(db, 'users', userCredential.user.uid);
                const userDoc = await userDocRef.get();
                
                if (userDoc.exists()) {
                    // Firestore-dan məlumatları al
                    const firestoreData = userDoc.data();
                    userData = {
                        email: userCredential.user.email,
                        uid: userCredential.user.uid,
                        name: firestoreData.name || userCredential.user.displayName || 'İstifadəçi',
                        displayName: firestoreData.name || userCredential.user.displayName || 'İstifadəçi',
                        photoURL: userCredential.user.photoURL || null,
                        createdAt: firestoreData.createdAt,
                        lastLogin: new Date().toISOString(), // Date-i string-ə çevir
                    };
                    
                    // Firestore-da lastLogin-i yenilə
                    await setDoc(userDocRef, {
                        ...firestoreData,
                        lastLogin: new Date().toISOString(), // Date-i string-ə çevir
                    }, { merge: true });
                    
                    console.log('User data restored from Firestore');
                } else {
                    // Firestore-da məlumat yoxdursa, yeni yarat
                    userData = {
                        email: userCredential.user.email,
                        uid: userCredential.user.uid,
                        name: userCredential.user.displayName || 'İstifadəçi',
                        displayName: userCredential.user.displayName || 'İstifadəçi',
                        photoURL: userCredential.user.photoURL || null,
                        createdAt: new Date().toISOString(), // Date-i string-ə çevir
                        lastLogin: new Date().toISOString(), // Date-i string-ə çevir
                    };
                    
                    // Firestore-da user document yarat
                    await setDoc(userDocRef, {
                        email: userData.email,
                        name: userData.name,
                        createdAt: userData.createdAt,
                        lastLogin: userData.lastLogin,
                    });
                    
                    console.log('New user document created in Firestore');
                }
            } catch (firestoreError) {
                console.log('Firestore error during login:', firestoreError);
                // Firestore xətası olsa da, basic məlumatlarla davam et
                userData = {
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                    name: userCredential.user.displayName || 'İstifadəçi',
                    displayName: userCredential.user.displayName || 'İstifadəçi',
                    photoURL: userCredential.user.photoURL || null,
                    createdAt: new Date().toISOString(), // Date-i string-ə çevir
                    lastLogin: new Date().toISOString(), // Date-i string-ə çevir
                };
            }
            
            // AsyncStorage-də user məlumatlarını saxla
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            // User-ə aid collection-ların mövcudluğunu yoxla və lazım olduqda yarat
            try {
                const userDocRef = doc(db, 'users', userCredential.user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (!userDoc.exists()) {
                    // User document yoxdursa yarat
                    await setDoc(userDocRef, {
                        email: userData.email,
                        name: userData.name,
                        lastLogin: new Date().toISOString(), // Date-i string-ə çevir
                    });
                } else {
                    // Mövcud user document-i yenilə
                    await setDoc(userDocRef, {
                        ...userDoc.data(),
                        lastLogin: new Date().toISOString(), // Date-i string-ə çevir
                    }, { merge: true });
                }
                
                console.log('User collections verified/created during login');
            } catch (collectionError) {
                console.log('Collection verification error (non-critical):', collectionError);
                // Collection xətası olsa da login uğurlu sayılır
            }

            console.log('User login successful - data restored');
            return userData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
);

// ==========================
// AUTO LOGIN
// ==========================
export const autoLogin = createAsyncThunk(
    'user/autoLogin',
    async () => {
        try {
            const storedData = await AsyncStorage.getItem('userData');
            if (storedData) {
                return JSON.parse(storedData);
            } else {
                // User məlumatı yoxdursa error throw etmə, sadəcə null qaytar
                return null;
            }
        } catch (error) {
            console.log('AutoLogin error:', error);
            // Error zamanı da null qaytar
            return null;
        }
    }
);

// ==========================
// LOGOUT
// ==========================
export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { getState }) => {
        try {
            // Əvvəlcə AsyncStorage-dən user məlumatlarını sil
            await AsyncStorage.removeItem('userData');
            
            // Kısa delay əlavə et
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Firebase-dən çıxış et
            await signOut(auth);
            
            // User collection-larını silmə - məlumatlar qalsın
            // User logout etdikdə məlumatları saxlanılmalıdır
            console.log('User logged out successfully - data preserved');
            
            // Heç bir məlumat qaytarma, sadəcə logout et
            return null;
        } catch (error) {
            console.error('Logout error:', error);
            // Error olsa da logout et
            try {
                await AsyncStorage.removeItem('userData');
            } catch (storageError) {
                console.log('Storage cleanup error:', storageError);
            }
            return null;
        }
    }
);

// ==========================
// UPDATE USER PROFILE
// ==========================
export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async ({ name, password }, { getState }) => {
        try {
            const { user } = getState().user;
            
            if (!user) {
                throw new Error('User not found');
            }

            // Əgər password dəyişdiriləcəksə
            if (password) {
                try {
                    // Firebase Auth-da password-i yenilə
                    await updatePassword(auth.currentUser, password);
                    console.log('Password updated successfully');
                } catch (passwordError) {
                    console.error('Password update error:', passwordError);
                    
                    // Əgər "requires-recent-login" xətası varsa
                    if (passwordError.code === 'auth/requires-recent-login') {
                        throw new Error('Təhlükəsizlik üçün yenidən giriş etməlisiniz. Lütfən çıxış edib yenidən giriş edin.');
                    }
                    
                    // Digər password xətaları
                    if (passwordError.code === 'auth/wrong-password') {
                        throw new Error('Cari şifrə yanlışdır');
                    }
                    
                    throw new Error('Şifrə dəyişdirilə bilmədi: ' + passwordError.message);
                }
            }

            // Əgər name dəyişdiriləcəksə
            if (name && name !== user.name) {
                try {
                    // Firebase Auth-da displayName-i yenilə
                    await updateProfile(auth.currentUser, {
                        displayName: name
                    });
                    console.log('Display name updated successfully');
                } catch (profileError) {
                    console.error('Profile update error:', profileError);
                    throw new Error('Ad dəyişdirilə bilmədi: ' + profileError.message);
                }
            }

            // User state-ini yenilə
            const updatedUser = {
                ...user,
                ...(name && { name }),
                ...(password && { passwordUpdated: true })
            };

            // AsyncStorage-də yenilə
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

            // Firestore-da da yenilə
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                    ...(name && { name }),
                    lastUpdated: new Date().toISOString(),
                }, { merge: true });
            } catch (firestoreError) {
                console.log('Firestore update error (non-critical):', firestoreError);
            }

            return updatedUser;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }
);

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // ==========================
        // SIGNUP
        // ==========================
        builder
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

        // ==========================
        // LOGIN
        // ==========================
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state) => {
                state.isLoading = false;
                state.error = 'Email və ya şifrə yanlışdır';
            })

        // ==========================
        // AUTO LOGIN
        // ==========================
            .addCase(autoLogin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(autoLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(autoLogin.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
            })

        // ==========================
        // UPDATE PROFILE
        // ==========================
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

        // ==========================
        // LOGOUT
        // ==========================
            .addCase(logoutUser.pending, (state) => {
                // Loading state-i aktiv et logout zamanı
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                // State-i təmizlə - bütün sahələri eyni anda
                state.user = null;
                state.token = null;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                // Error olsa da state-i təmizlə - bütün sahələri eyni anda
                state.user = null;
                state.token = null;
                state.isLoading = false;
                state.error = null;
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;

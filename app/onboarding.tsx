import { router } from 'expo-router';
import { Building2, User, Sparkles, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { useUserProfile } from '@/hooks/useUserProfile';

type ProfileType = 'employer' | 'employee' | null;

export default function OnboardingScreen() {
  const { createEmployerProfile, createEmployeeProfile, completeOnboarding } = useUserProfile();
  
  const [step, setStep] = useState<number>(1);
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    role: '',
    department: '',
  });

  const handleNext = () => {
    if (step === 1 && !profileType) {
      Alert.alert('Selection Required', 'Please select your profile type');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    if (!formData.role.trim()) {
      Alert.alert('Validation Error', 'Please enter your role');
      return false;
    }
    if (!formData.department.trim()) {
      Alert.alert('Validation Error', 'Please enter your department');
      return false;
    }

    if (profileType === 'employer' && !formData.companyName.trim()) {
      Alert.alert('Validation Error', 'Please enter your company name');
      return false;
    }



    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      if (profileType === 'employer') {
        await createEmployerProfile({
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          role: formData.role,
          department: formData.department,
        });
      } else if (profileType === 'employee') {
        await createEmployeeProfile({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          managerId: 'auto-assigned',
          companyId: 'default-company',
        });
      }

      await completeOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Sparkles size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Welcome to FocusTime</Text>
        <Text style={styles.subtitle}>Boost productivity with smart time tracking and focus management</Text>
      </View>

      <View style={styles.profileOptions}>
        <TouchableOpacity
          style={[
            styles.profileTypeCard,
            styles.employerCard,
            profileType === 'employer' && styles.selectedEmployerCard,
          ]}
          onPress={() => setProfileType('employer')}
          testID="employer-option"
        >
          <View style={styles.cardIconContainer}>
            <Building2 
              size={40} 
              color={profileType === 'employer' ? Colors.white : Colors.purple} 
            />
          </View>
          <Text style={[
            styles.cardTitle,
            profileType === 'employer' && styles.selectedCardText,
            !profileType && styles.employerCardTitle,
          ]}>
            Team Manager
          </Text>
          <Text style={[
            styles.cardDescription,
            profileType === 'employer' && styles.selectedCardText,
            !profileType && styles.employerCardDescription,
          ]}>
            Manage team productivity, set policies, and view detailed analytics
          </Text>
          <View style={[
            styles.cardBadge,
            styles.employerBadge,
            profileType === 'employer' && styles.selectedBadge,
          ]}>
            <Zap size={16} color={profileType === 'employer' ? Colors.purple : Colors.white} />
            <Text style={[
              styles.badgeText,
              profileType === 'employer' && styles.selectedBadgeText,
            ]}>Pro</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.profileTypeCard,
            styles.employeeCard,
            profileType === 'employee' && styles.selectedEmployeeCard,
          ]}
          onPress={() => setProfileType('employee')}
          testID="employee-option"
        >
          <View style={styles.cardIconContainer}>
            <User 
              size={40} 
              color={profileType === 'employee' ? Colors.white : Colors.cyan} 
            />
          </View>
          <Text style={[
            styles.cardTitle,
            profileType === 'employee' && styles.selectedCardText,
            !profileType && styles.employeeCardTitle,
          ]}>
            Individual User
          </Text>
          <Text style={[
            styles.cardDescription,
            profileType === 'employee' && styles.selectedCardText,
            !profileType && styles.employeeCardDescription,
          ]}>
            Track your time, boost focus, and monitor your productivity
          </Text>
          <View style={[
            styles.cardBadge,
            styles.employeeBadge,
            profileType === 'employee' && styles.selectedBadge,
          ]}>
            <Text style={[
              styles.badgeText,
              profileType === 'employee' && styles.selectedBadgeText,
            ]}>Free</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>
        {profileType === 'employer' ? 'Company Setup' : 'Employee Setup'}
      </Text>
      <Text style={styles.subtitle}>
        Please provide your information
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your full name"
            testID="name-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            testID="email-input"
          />
        </View>

        {profileType === 'employer' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={formData.companyName}
              onChangeText={(text) => setFormData({ ...formData, companyName: text })}
              placeholder="Enter your company name"
              testID="company-input"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            style={styles.input}
            value={formData.role}
            onChangeText={(text) => setFormData({ ...formData, role: text })}
            placeholder="Enter your role"
            testID="role-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            value={formData.department}
            onChangeText={(text) => setFormData({ ...formData, department: text })}
            placeholder="Enter your department"
            testID="department-input"
          />
        </View>


      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="outline"
            testID="back-button"
          />
        )}
        
        {step === 1 ? (
          <Button
            title="Continue"
            onPress={handleNext}
            disabled={!profileType}
            testID="next-button"
          />
        ) : (
          <Button
            title="Get Started"
            onPress={handleComplete}
            loading={isLoading}
            testID="complete-button"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  profileOptions: {
    gap: 20,
  },
  profileTypeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  employerCard: {
    backgroundColor: Colors.purple + '10',
    borderColor: Colors.purple + '30',
  },
  employeeCard: {
    backgroundColor: Colors.cyan + '10',
    borderColor: Colors.cyan + '30',
  },
  selectedEmployerCard: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  selectedEmployeeCard: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  employerCardTitle: {
    color: Colors.purple,
  },
  employeeCardTitle: {
    color: Colors.cyan,
  },
  selectedCardText: {
    color: Colors.white,
  },
  cardDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  employerCardDescription: {
    color: Colors.gray[700],
  },
  employeeCardDescription: {
    color: Colors.gray[700],
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  employerBadge: {
    backgroundColor: Colors.purple,
  },
  employeeBadge: {
    backgroundColor: Colors.cyan,
  },
  selectedBadge: {
    backgroundColor: Colors.white,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  selectedBadgeText: {
    color: Colors.purple,
  },
  formContainer: {
    gap: 20,
    marginTop: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
});
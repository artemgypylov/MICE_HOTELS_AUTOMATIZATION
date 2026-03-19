import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING } from '../utils/constants';
import type { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.companyName && (
            <Text style={styles.companyName}>{user.companyName}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Hotels')}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Create New Booking</Text>
              <Text style={styles.cardDescription}>
                Start planning your event with our 5-step wizard
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>My Bookings</Text>
              <Text style={styles.cardDescription}>
                View and manage your event bookings
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🏨 Hotel Selection</Text>
            <Text style={styles.featureDescription}>
              Browse and select from premium event venues
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🍽️ Catering Services</Text>
            <Text style={styles.featureDescription}>
              Choose from various dining options and menus
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🎤 Additional Services</Text>
            <Text style={styles.featureDescription}>
              AV equipment, floristics, transfer, and more
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>💰 Real-time Pricing</Text>
            <Text style={styles.featureDescription}>
              Get instant cost estimates as you build your event
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  companyName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardArrow: {
    fontSize: 24,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  featureCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;

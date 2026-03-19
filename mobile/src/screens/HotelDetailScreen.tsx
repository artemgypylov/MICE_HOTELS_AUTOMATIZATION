import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { hotelsAPI } from '../services/api';
import { COLORS, SPACING } from '../utils/constants';
import type { Hotel, Hall, RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'HotelDetail'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'HotelDetail'>;

const HotelDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { hotelId } = route.params;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHotelDetails();
  }, [hotelId]);

  const loadHotelDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [hotelData, hallsData] = await Promise.all([
        hotelsAPI.getById(hotelId),
        hotelsAPI.getHalls(hotelId),
      ]);
      setHotel(hotelData);
      setHalls(hallsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load hotel details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading hotel details...</Text>
      </View>
    );
  }

  if (error || !hotel) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error || 'Hotel not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHotelDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          {hotel.address && (
            <Text style={styles.hotelDetail}>📍 {hotel.address}</Text>
          )}
          {hotel.contactPhone && (
            <Text style={styles.hotelDetail}>📞 {hotel.contactPhone}</Text>
          )}
          {hotel.contactEmail && (
            <Text style={styles.hotelDetail}>✉️ {hotel.contactEmail}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Event Halls</Text>
          {halls.length > 0 ? (
            halls.map((hall) => (
              <View key={hall.id} style={styles.hallCard}>
                <Text style={styles.hallName}>{hall.name}</Text>
                <Text style={styles.hallDetail}>
                  👥 Capacity: up to {hall.maxCapacity} people
                </Text>
                {hall.areaSqm && (
                  <Text style={styles.hallDetail}>
                    📐 Area: {hall.areaSqm} m²
                  </Text>
                )}
                <Text style={styles.hallPrice}>
                  💰 From ${hall.basePricePerDay.toFixed(2)}/day
                </Text>
                {hall.description && (
                  <Text style={styles.hallDescription}>{hall.description}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No halls available</Text>
          )}
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionText}>
            Ready to create a booking for this hotel?
          </Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => {
              // TODO: Navigate to wizard when implemented
              alert('Booking wizard coming soon!');
            }}
          >
            <Text style={styles.bookButtonText}>Start Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    padding: SPACING.lg,
  },
  hotelInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  hotelDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
  hallCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  hallName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  hallDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  hallPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  hallDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  actionSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});

export default HotelDetailScreen;

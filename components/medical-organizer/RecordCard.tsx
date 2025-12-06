import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { MedicalRecord } from '../../constants/types';

interface RecordCardProps {
  record: MedicalRecord;
  onPress: () => void;
  onDelete: () => void;
  highlight?: boolean;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onPress,
  onDelete,
  highlight = false,
}) => {
  const bgAnim = useRef(new Animated.Value(1)).current;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // New-record highlight animation: green → white over 800ms
  useEffect(() => {
    if (highlight) {
      bgAnim.setValue(0);
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false, // color interpolation can't use native driver
      }).start();
    }
  }, [highlight, bgAnim]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#dcfce7', '#ffffff'], // light green → white
  });

  // Two-step delete confirmation on the card itself
  useEffect(() => {
    if (!confirmingDelete) return;
    const timeout = setTimeout(() => setConfirmingDelete(false), 2000);
    return () => clearTimeout(timeout);
  }, [confirmingDelete]);

  const handleDeletePress = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
    } else {
      onDelete();
      setConfirmingDelete(false);
    }
  };

  return (
    <Animated.View style={[styles.card, { backgroundColor }]}>
      {/* Main tappable content */}
      <Pressable style={styles.content} onPress={onPress}>
        <Text style={styles.name} numberOfLines={1}>
          {record.patientName || 'Unknown Patient'}
        </Text>
        <Text style={styles.provider}>
          {record.provider || 'N/A Provider'}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Diagnosis: </Text>
          {record.diagnosis?.[0] || 'No primary diagnosis'}
        </Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Visit Date: </Text>
          {record.visitDate || 'N/A'}
        </Text>
      </Pressable>

      {/* Delete button with inline confirmation */}
      <Pressable
        style={[
          styles.deleteButton,
          confirmingDelete && styles.deleteButtonConfirm,
        ]}
        onPress={handleDeletePress}
      >
        <Text
          style={[
            styles.deleteText,
            confirmingDelete && styles.deleteTextConfirm,
          ]}
        >
          {confirmingDelete ? 'Confirm' : '🗑'}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  provider: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 2,
  },
  field: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  label: {
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
    alignSelf: 'center',
  },
  deleteButtonConfirm: {
    backgroundColor: '#b91c1c',
  },
  deleteText: {
    fontSize: 16,
    color: '#b91c1c',
  },
  deleteTextConfirm: {
    color: '#fef2f2',
    fontSize: 12,
    fontWeight: '700',
  },
});

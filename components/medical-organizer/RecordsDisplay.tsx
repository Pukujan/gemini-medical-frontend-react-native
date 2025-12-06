import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MedicalRecord } from '../../constants/types';
import { RecordCard } from './RecordCard';

interface RecordsDisplayProps {
  records: MedicalRecord[];
  isLoading: boolean;
  onSelectRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  highlightRecordId?: string | null; // NEW
}

export const RecordsDisplay: React.FC<RecordsDisplayProps> = ({
  records,
  isLoading,
  onSelectRecord,
  onDeleteRecord,
  highlightRecordId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;

    const q = searchTerm.toLowerCase();
    return records.filter((r) => {
      const name = r.patientName?.toLowerCase() ?? '';
      const provider = r.provider?.toLowerCase() ?? '';
      const diagnosisText = (r.diagnosis ?? []).join(' ').toLowerCase();

      return (
        name.includes(q) ||
        provider.includes(q) ||
        diagnosisText.includes(q)
      );
    });
  }, [records, searchTerm]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Records ({filteredRecords.length})
      </Text>

      {/* Search bar with icon */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search by name, diagnosis, or provider…"
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {filteredRecords.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No records found. Try processing a new record or adjusting your
            search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecordCard
              record={item}
              onPress={() => onSelectRecord(item)}
              onDelete={() => onDeleteRecord(item.id)}
              highlight={highlightRecordId === item.id} // NEW
            />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  emptyText: {
    fontSize: 12,
    color: '#4b5563',
  },
});

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { APP_ID, getFirebase } from '../constants/firebaseConfig';
import { callGeminiForRecord, createMarkdownReport } from '../constants/gemini';
import { MedicalRecord, MedicalRecordBase } from '../constants/types';

import { DetailModal } from '../components/medical-organizer/DetailModal';
import { InputPanel } from '../components/medical-organizer/InputPanel';
import { RecordsDisplay } from '../components/medical-organizer/RecordsDisplay';

export default function IndexScreen() {
  const [db, setDb] = useState<ReturnType<typeof getFirebase>['db'] | null>(
    null,
  );
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );

  // For "new record" green highlight
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Initialize Firebase once
  useEffect(() => {
    try {
      const { db } = getFirebase();
      setDb(db);
    } catch (e: any) {
      console.error('Firebase init error:', e);
      setError(e?.message ?? 'Failed to initialize Firebase.');
    }
  }, []);

  // Listen to Firestore records
  useEffect(() => {
    if (!db) return;

    const path = `artifacts/${APP_ID}/public/data/medicalRecords`;
    const colRef = collection(db, path);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recs: MedicalRecord[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() as MedicalRecordBase & {
              createdAt?: Timestamp;
              processedBy?: string;
              markdownReport?: string;
              rawText?: string;
            };
            return {
              id: docSnap.id,
              ...data,
            } as any;
          })
          .sort((a, b) => {
            const aDate = (a as any).createdAt?.toDate?.();
            const bDate = (b as any).createdAt?.toDate?.();
            if (aDate && bDate) {
              return bDate.getTime() - aDate.getTime();
            }
            return 0;
          });

        setRecords(recs);
      },
      (err) => {
        console.error('Firestore listen error:', err);
        setError('Failed to fetch records from database.');
      },
    );

    return () => unsubscribe();
  }, [db]);

  const processRecord = useCallback(async () => {
    if (isLoading) return;

    if (!rawInput.trim()) {
      setError('Please enter or generate some unformatted text first.');
      return;
    }
    if (!db) {
      setError('Database not ready. Check Firebase config.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const structuredData = await callGeminiForRecord(rawInput);
      const reportText = createMarkdownReport(structuredData);

      const colRef = collection(
        db,
        `artifacts/${APP_ID}/public/data/medicalRecords`,
      );

      const docRef = await addDoc(colRef, {
        ...structuredData,
        markdownReport: reportText,
        rawText: rawInput,
        createdAt: serverTimestamp(),
        processedBy: 'mobile-client',
      });

      setRawInput('');
      setJustAddedId(docRef.id); // mark this one as "new"
    } catch (e: any) {
      console.error('Processing failed:', e);
      setError(e?.message ?? 'Failed to process record.');
    } finally {
      setIsLoading(false);
    }
  }, [db, rawInput, isLoading]);

  // No Alert here — just delete and update state
  const deleteRecord = useCallback(
    async (id: string) => {
      if (!db) {
        setError('Database not ready. Check Firebase config.');
        return;
      }

      try {
        const path = `artifacts/${APP_ID}/public/data/medicalRecords`;
        const docRef = doc(db, path, id);
        await deleteDoc(docRef);

        // Optimistic UI update
        setRecords((prev) => prev.filter((r) => r.id !== id));

        // Close detail modal if it was open
        setSelectedRecord((prev) => (prev && prev.id === id ? null : prev));

        // Clear highlight if needed
        setJustAddedId((prev) => (prev === id ? null : prev));
      } catch (e: any) {
        console.error('Delete failed:', e);
        setError(e?.message ?? 'Failed to delete record.');
      }
    },
    [db],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          Gemini Medical Record Organizer (Mobile)
        </Text>
        <Text style={styles.subheader}>
          Paste unformatted notes or generate sample data, then let Gemini
          structure and save them to Firestore.
        </Text>

        <InputPanel
          rawInput={rawInput}
          setRawInput={setRawInput}
          error={error}
          isLoading={isLoading}
          onProcess={processRecord}
        />

        <RecordsDisplay
          records={records}
          isLoading={isLoading}
          onSelectRecord={setSelectedRecord}
          onDeleteRecord={deleteRecord}
          highlightRecordId={justAddedId} // used for green fade animation
        />

        <View style={{ marginTop: 12 }}>
          <Text style={styles.debug}>
            Debug — records: {records.length} | loading: {String(isLoading)}
          </Text>
        </View>
      </ScrollView>

      <DetailModal
        visible={!!selectedRecord}
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onDelete={(record) => deleteRecord(record.id)} // delete from inside modal
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827',
  },
  subheader: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 12,
  },
  debug: {
    fontSize: 10,
    textAlign: 'center',
    color: '#9ca3af',
  },
});

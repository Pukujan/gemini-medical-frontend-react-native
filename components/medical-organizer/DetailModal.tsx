// components/medical-organizer/DetailModal.tsx
import React from 'react';
import {
  Button,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MedicalRecord } from '../../constants/types';

type Props = {
  visible: boolean;
  record: MedicalRecord | null;
  onClose: () => void;
  onAskAI?: (record: MedicalRecord) => Promise<void> | void;
  loadingAI?: boolean;
  onDelete?: (record: MedicalRecord) => void;
};

export const DetailModal: React.FC<Props> = ({
  visible,
  record,
  onClose,
  onAskAI,
  loadingAI,
  onDelete,
}) => {
  if (!record || !visible) return null;

  // We know Firestore docs also contain these, even if TS type doesn't
  const r = record as any;
  const patientName = r.patientName || 'Unknown Patient';
  const provider = r.provider || 'N/A Provider';
  const dob = r.dob || 'N/A';
  const visitDate = r.visitDate || 'N/A';
  const summary = r.summary || 'No AI summary available.';
  const rawText = r.rawText || 'No original raw text stored.';
  const markdownReport =
    r.markdownReport || 'No markdown report stored for this record.';

  const handleDownloadMarkdown = async () => {
    if (!markdownReport || markdownReport.trim().length === 0) return;
    try {
      await Share.share({
        message: markdownReport,
        title: 'medical-record-report.md',
      });
    } catch (e) {
      console.error('Error sharing markdown report:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            {/* Header: patient & visit info */}
            <Text style={styles.title}>{patientName}</Text>
            <Text style={styles.meta}>
              Provider: {provider} {'\n'}
              DOB: {dob} {'\n'}
              Visit Date: {visitDate}
            </Text>

            {/* AI summary (structured summary text from Gemini) */}
            <Text style={styles.heading}>AI Summary (Structured)</Text>
            <Text style={styles.summaryText}>{summary}</Text>

            {/* 🔹 Markdown report FIRST (formatted) */}
            <Text style={styles.heading}>Markdown Report (Formatted)</Text>
            <View style={styles.markdownBox}>
              <Text style={styles.markdownText}>{markdownReport}</Text>
            </View>

            {/* 🔹 Raw input AFTER the formatted report */}
            <Text style={styles.heading}>Raw Input (Unformatted Notes)</Text>
            <View style={styles.rawBox}>
              <Text style={styles.rawText}>{rawText}</Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {onAskAI && (
              <View style={styles.actionButton}>
                <Button
                  title={loadingAI ? 'Asking AI...' : 'Ask AI'}
                  onPress={() => onAskAI(record)}
                  disabled={loadingAI}
                />
              </View>
            )}

            <View style={styles.actionButton}>
              <Button title="Download Markdown" onPress={handleDownloadMarkdown} />
            </View>

            {onDelete && (
              <View style={styles.actionButton}>
                <Button
                  title="Delete"
                  color="#ff4d4f"
                  onPress={() => onDelete(record)}
                />
              </View>
            )}

            <View style={styles.actionButton}>
              <Button title="Close" onPress={onClose} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#aaaaaa',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  heading: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  summaryText: {
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 20,
  },
  markdownBox: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginBottom: 8,
  },
  markdownText: {
    color: '#f9fafb',
    fontSize: 15, // bigger than raw text
    lineHeight: 22,
  },
  rawBox: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  rawText: {
    color: '#9ca3af',
    fontSize: 12, // smaller than markdown
    lineHeight: 18,
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
});

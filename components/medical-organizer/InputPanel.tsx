import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { generateSampleRawMedicalText } from '../../constants/gemini';

interface InputPanelProps {
  rawInput: string;
  setRawInput: (value: string) => void;
  error: string | null;
  isLoading: boolean;
  onProcess: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  rawInput,
  setRawInput,
  error,
  isLoading,
  onProcess,
}) => {
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const handleLoadSample = async () => {
    if (isSampleLoading) return;
    setSampleError(null);
    setIsSampleLoading(true);

    try {
      const sample = await generateSampleRawMedicalText();
      setRawInput(sample);
    } catch (e: any) {
      console.error('Sample data generation failed:', e);
      setSampleError(e?.message ?? 'Failed to generate sample data.');
    } finally {
      setIsSampleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>1. Input Raw Record Text</Text>

      <TextInput
        multiline
        placeholder="Paste unformatted notes or tap 'Load Sample Demo Data'..."
        value={rawInput}
        onChangeText={setRawInput}
        editable={!isLoading}
        style={styles.textArea}
      />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {sampleError && (
        <View style={styles.sampleErrorBox}>
          <Text style={styles.sampleErrorText}>Sample: {sampleError}</Text>
        </View>
      )}

      <Pressable
        onPress={onProcess}
        disabled={isLoading || !rawInput.trim()}
        style={({ pressed }) => [
          styles.button,
          (isLoading || !rawInput.trim()) && styles.buttonDisabled,
          pressed && !isLoading && rawInput.trim() && styles.buttonPressed,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Process, Format & Save Record</Text>
        )}
      </Pressable>

      <Pressable
        onPress={handleLoadSample}
        disabled={isSampleLoading}
        style={({ pressed }) => [
          styles.sampleButton,
          isSampleLoading && styles.sampleButtonDisabled,
          pressed && !isSampleLoading && styles.sampleButtonPressed,
        ]}
      >
        {isSampleLoading ? (
          <ActivityIndicator color="#1d4ed8" />
        ) : (
          <Text style={styles.sampleButtonText}>Load Sample Demo Data</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  errorBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
  },
  sampleErrorBox: {
    marginTop: 4,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  sampleErrorText: {
    fontSize: 11,
    color: '#92400e',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  sampleButton: {
    marginTop: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  sampleButtonDisabled: {
    opacity: 0.6,
  },
  sampleButtonPressed: {
    opacity: 0.85,
  },
  sampleButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 13,
  },
});

import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COUNTRY_DIALS, getCountryByDial } from '../utils/phone';

type Props = {
  dial: string;
  local: string;
  onDialChange: (dial: string) => void;
  onLocalChange: (local: string) => void;
  editable?: boolean;
};

export default function PhoneField({
  dial,
  local,
  onDialChange,
  onLocalChange,
  editable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const country = getCountryByDial(dial);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_DIALS;
    return COUNTRY_DIALS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.iso.toLowerCase().includes(q) ||
        item.dial.includes(q.replace(/[^\d]/g, ''))
    );
  }, [query]);

  return (
    <>
      <View style={[styles.row, !editable && styles.readonly]}>
        <TouchableOpacity
          style={styles.codeBtn}
          onPress={() => editable && setOpen(true)}
          disabled={!editable}
        >
          <Text style={styles.codeText}>
            {country.flag} +{country.dial}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="1012345678"
          placeholderTextColor="#666"
          value={local}
          onChangeText={onLocalChange}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
        />
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.title}>Country code</Text>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Search country"
              placeholderTextColor="#777"
              autoCapitalize="none"
            />
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {options.map((item) => (
                <TouchableOpacity
                  key={`${item.iso}-${item.dial}`}
                  style={styles.option}
                  onPress={() => {
                    onDialChange(item.dial);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Text style={styles.optionText}>
                    {item.flag}  {item.name}  +{item.dial}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.close} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  readonly: { opacity: 0.7 },
  codeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  codeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  search: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  list: { maxHeight: 360 },
  option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  optionText: { color: '#eee', fontSize: 15 },
  close: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeText: { color: '#fff', fontWeight: '700' },
});

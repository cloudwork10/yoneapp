import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  RELEASE_MONTHS,
  formatReleaseLabel,
  isoFromParts,
  partsFromIso,
} from '../utils/episodeRelease';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function ComingSoonReleaseFields({
  comingSoon,
  releaseDate,
  onChange,
  availableLabel = 'Available now',
  soonLabel = 'Coming soon',
}: {
  comingSoon?: boolean;
  releaseDate?: string | Date | null;
  onChange: (next: { comingSoon: boolean; releaseDate: string | null }) => void;
  availableLabel?: string;
  soonLabel?: string;
}) {
  const parsed = partsFromIso(releaseDate);
  const [monthIndex, setMonthIndex] = useState<number | null>(parsed.monthIndex);
  const [day, setDay] = useState(parsed.day || '');
  const [year, setYear] = useState(parsed.year || String(new Date().getUTCFullYear()));

  useEffect(() => {
    const next = partsFromIso(releaseDate);
    if (!releaseDate) return;
    setMonthIndex(next.monthIndex);
    setDay(next.day || '');
    setYear(next.year || String(new Date().getUTCFullYear()));
  }, [releaseDate]);

  const iso = useMemo(
    () => isoFromParts(monthIndex, Number(day), Number(year)),
    [monthIndex, day, year]
  );
  const label = formatReleaseLabel(iso);

  const commit = (nextMonth: number | null, nextDay: string, nextYear: string) => {
    setMonthIndex(nextMonth);
    setDay(nextDay);
    setYear(nextYear);
    onChange({
      comingSoon: true,
      releaseDate: isoFromParts(nextMonth, Number(nextDay), Number(nextYear)),
    });
  };

  const setComingSoon = (next: boolean) => {
    if (!next) {
      setMonthIndex(null);
      setDay('');
      onChange({ comingSoon: false, releaseDate: null });
      return;
    }
    onChange({ comingSoon: true, releaseDate: iso });
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Release</Text>
      <Text style={styles.hint}>Coming soon stays locked. Pick any month and any day, like Apr 12.</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.switch, !comingSoon && styles.switchOn]}
          onPress={() => setComingSoon(false)}
        >
          <Text style={styles.switchText}>{availableLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switch, comingSoon && styles.switchOn]}
          onPress={() => setComingSoon(true)}
        >
          <Text style={styles.switchText}>{soonLabel}</Text>
        </TouchableOpacity>
      </View>

      {comingSoon ? (
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Month</Text>
          <View style={styles.months}>
            {RELEASE_MONTHS.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[styles.month, monthIndex === index && styles.monthOn]}
                onPress={() => commit(index, day, year)}
              >
                <Text style={[styles.monthText, monthIndex === index && styles.monthTextOn]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.dateLabel}>Day</Text>
          <View style={styles.days}>
            {DAYS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.dayChip, String(item) === String(Number(day)) && styles.dayChipOn]}
                onPress={() => commit(monthIndex, String(item), year)}
              >
                <Text style={[styles.dayChipText, String(item) === String(Number(day)) && styles.dayChipTextOn]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dayRow}>
            <TextInput
              style={styles.dayInput}
              value={day}
              onChangeText={(text) => commit(monthIndex, text.replace(/[^\d]/g, '').slice(0, 2), year)}
              placeholder="Day"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={2}
            />
            <TextInput
              style={[styles.dayInput, styles.yearInput]}
              value={year}
              onChangeText={(text) => commit(monthIndex, day, text.replace(/[^\d]/g, '').slice(0, 4))}
              placeholder="Year"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={4}
            />
            {label ? <Text style={styles.preview}>{label}</Text> : <Text style={styles.previewMuted}>Pick month + day</Text>}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  switch: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  switchOn: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  switchText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  dateBox: {
    marginTop: 12,
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dateLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  months: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  month: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#242424',
  },
  monthOn: {
    backgroundColor: '#E50914',
  },
  monthText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
  },
  monthTextOn: {
    color: '#fff',
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  dayChip: {
    width: 36,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipOn: {
    backgroundColor: '#E50914',
  },
  dayChipText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
  },
  dayChipTextOn: {
    color: '#fff',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayInput: {
    width: 64,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'center',
  },
  yearInput: {
    width: 80,
  },
  preview: {
    color: '#fff',
    fontWeight: '700',
  },
  previewMuted: {
    color: '#777',
  },
});

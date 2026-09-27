import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors } from '@/theme/colors';
import { formatLongDate } from '@/logic/dates';

interface Props {
  dateISO: string;
  onChange: (dateISO: string) => void;
  label?: string;
}

// Builds the ISO date from the picker's local Y/M/D directly, rather than going through
// toISOString() (UTC), which can shift a midnight-local date to the previous day in
// timezones behind UTC.
function localDateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** A date picker for backdating an entry — defaults to today but lets the user pick
 * any past date (e.g. logging a measurement or workout they forgot to enter same-day). */
export function DateField({ dateISO, onChange, label = 'Date' }: Props) {
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: isoToLocalDate(dateISO),
        mode: 'date',
        maximumDate: new Date(),
        onValueChange: (_event, selected) => {
          if (selected) onChange(localDateToISO(selected));
        },
      });
    } else if (Platform.OS === 'ios') {
      setShowIOSPicker(true);
    }
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {Platform.OS === 'web' ? (
        // No web implementation of the native picker — plain text entry keeps this
        // testable in the web preview used during development.
        <TextInput
          value={dateISO}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
      ) : (
        <Pressable onPress={openPicker} style={styles.row}>
          <Text style={styles.dateText}>{formatLongDate(dateISO)}</Text>
          <Text style={styles.changeLink}>Change</Text>
        </Pressable>
      )}
      {Platform.OS === 'ios' && showIOSPicker && (
        <DateTimePicker
          value={isoToLocalDate(dateISO)}
          mode="date"
          display="inline"
          maximumDate={new Date()}
          onValueChange={(_event, selected) => {
            setShowIOSPicker(false);
            if (selected) onChange(localDateToISO(selected));
          }}
          onDismiss={() => setShowIOSPicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  dateText: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  changeLink: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
});

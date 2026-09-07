import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type CertificateFields = {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  founderName: string;
  issuedLabel: string;
};

const SERIF = Platform.OS === 'ios' ? 'Times New Roman' : 'serif';

export default function CertificateCard({
  fields,
  compact = false,
}: {
  fields: CertificateFields;
  compact?: boolean;
}) {
  return (
    <View style={[styles.page, compact && styles.pageCompact]}>
      <View style={[styles.wave, styles.waveTl1]} />
      <View style={[styles.wave, styles.waveTl2]} />
      <View style={[styles.wave, styles.waveTl3]} />
      <View style={[styles.wave, styles.waveBr1]} />
      <View style={[styles.wave, styles.waveBr2]} />
      <View style={[styles.wave, styles.waveBr3]} />
      <View style={styles.frame}>
        <Text style={[styles.title, compact && styles.titleCompact]}>CERTIFICATE</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>OF ACHIEVEMENT</Text>
        <Text style={[styles.program, compact && styles.programCompact]}>ELNADY LEARNING PROGRAM</Text>
        <View style={styles.dividerWrap}>
          <View style={styles.divider} />
          <Text style={styles.dividerMark}>◆</Text>
        </View>
        <Text style={[styles.presented, compact && styles.presentedCompact]}>
          THIS CERTIFICATE IS PROUDLY PRESENTED TO
        </Text>
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
          {fields.studentName}
        </Text>
        <Text style={[styles.copy, compact && styles.copyCompact]}>
          for successfully completing the{' '}
          <Text style={styles.course}>{fields.courseTitle}</Text>
          {' '}course as part of the ELNADY Learning Program, with high performance and outstanding achievement.
        </Text>
        <View style={styles.footer}>
          <View style={styles.sign}>
            <Text style={[styles.signScript, compact && styles.signScriptCompact]}>Signature</Text>
            <View style={styles.signLine} />
            <Text style={[styles.signName, compact && styles.signNameCompact]} numberOfLines={2}>
              {fields.instructorName}
            </Text>
            <Text style={styles.signRole}>COURSE INSTRUCTOR</Text>
          </View>
          <View style={[styles.seal, compact && styles.sealCompact]} />
          <View style={styles.sign}>
            <Text style={[styles.signScript, compact && styles.signScriptCompact]}>Signature</Text>
            <View style={styles.signLine} />
            <Text style={[styles.signName, compact && styles.signNameCompact]} numberOfLines={2}>
              {fields.founderName}
            </Text>
            <Text style={styles.signRole}>FOUNDER</Text>
          </View>
        </View>
        <Text style={styles.date}>{fields.issuedLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    aspectRatio: 842 / 595,
    backgroundColor: '#f4f6f9',
    overflow: 'hidden',
    borderRadius: 4,
  },
  pageCompact: {
    aspectRatio: 842 / 595,
  },
  wave: {
    position: 'absolute',
    borderRadius: 999,
  },
  waveTl1: { top: -52, left: -64, width: 150, height: 136, backgroundColor: '#0b234d' },
  waveTl2: { top: -28, left: -40, width: 112, height: 100, backgroundColor: '#163b78' },
  waveTl3: { top: -6, left: -16, width: 80, height: 72, backgroundColor: '#2a5aa3' },
  waveBr1: { bottom: -56, right: -68, width: 160, height: 142, backgroundColor: '#0b234d' },
  waveBr2: { bottom: -30, right: -40, width: 118, height: 106, backgroundColor: '#163b78' },
  waveBr3: { bottom: -4, right: -16, width: 84, height: 76, backgroundColor: '#2a5aa3' },
  frame: {
    flex: 1,
    margin: '5.4%',
    borderWidth: 1,
    borderColor: '#12315c',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: 'center',
  },
  title: {
    fontFamily: SERIF,
    color: '#0c2348',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  titleCompact: { fontSize: 16, letterSpacing: 1 },
  subtitle: {
    fontFamily: SERIF,
    color: '#0c2348',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
    fontWeight: '600',
  },
  subtitleCompact: { fontSize: 8 },
  program: {
    color: '#16386f',
    fontSize: 8,
    letterSpacing: 1.2,
    marginTop: 6,
    fontWeight: '700',
  },
  programCompact: { fontSize: 7, marginTop: 4 },
  dividerWrap: {
    width: 110,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#16386f',
  },
  dividerMark: {
    position: 'absolute',
    backgroundColor: '#f4f6f9',
    color: '#16386f',
    fontSize: 8,
    paddingHorizontal: 6,
  },
  presented: {
    fontFamily: SERIF,
    color: '#222',
    fontSize: 8,
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  presentedCompact: { fontSize: 7 },
  name: {
    color: '#111',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#c5c9d1',
    paddingBottom: 4,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  nameCompact: { fontSize: 14 },
  copy: {
    fontFamily: SERIF,
    color: '#222',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  copyCompact: { fontSize: 8, lineHeight: 11 },
  course: { fontWeight: '700' },
  footer: {
    marginTop: 'auto',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sign: {
    flex: 1,
    alignItems: 'center',
  },
  signScript: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 13,
    color: '#111',
  },
  signScriptCompact: { fontSize: 10 },
  signLine: {
    width: '80%',
    height: 1,
    backgroundColor: '#222',
    marginTop: 2,
    marginBottom: 4,
  },
  signName: {
    color: '#111',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  signNameCompact: { fontSize: 8 },
  signRole: {
    color: '#333',
    fontSize: 7,
    letterSpacing: 0.4,
    marginTop: 2,
    textAlign: 'center',
  },
  seal: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#c5d2e0',
    borderWidth: 4,
    borderColor: '#9aadc2',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  sealCompact: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    marginBottom: 6,
  },
  date: {
    color: '#666',
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { THEME } from '../theme';
import { ASSETS } from '../assets';

// Static chapter content is independent of component state.
const lessons = [
  {
    num: '01',
    title: 'The Hidden Gate',
    jp: '山門',
    desc: 'Why a gate is a sentence, and what you agree to when you walk under one.',
    time: '14 min',
    detail:
      'Thresholds in Kyoto architecture are deliberate boundaries. Stepping across is an intentional commitment of mind and body.',
  },
  {
    num: '02',
    title: 'Borrowed Scenery',
    jp: '借景',
    desc: 'Shakkei: composing with a mountain you will never own.',
    time: '18 min',
    detail:
      'The garden does not end at the wall. Distant peaks and passing clouds become part of the immediate composition without ever possessing them.',
  },
  {
    num: '03',
    title: 'Charred Cypress',
    jp: '焼杉',
    desc: 'Yakisugi: burning a board black so the weather will let it live.',
    time: '21 min',
    detail:
      'Fire is not used for destruction, but preservation. Charring the cedar surface creates an impenetrable shield against century-long rains.',
  },
  {
    num: '04',
    title: 'Lantern Light',
    jp: '灯籠',
    desc: 'How a single ember decides the scale of everything around it.',
    time: '17 min',
    detail:
      'In true Japanese aesthetic, light is not flooded. A modest candle inside stone defines the boundary of comfort and darkness.',
  },
  {
    num: '05',
    title: 'The Vermilion Moon',
    jp: '朱月',
    desc: 'Why the moon burns red over the valley, and what the garden does with it.',
    time: '22 min',
    detail:
      'Rising through mountain fog, the lunar disc turns ochre and vermilion, casting copper highlights across wet rocks and gravel ripples.',
  },
];

function ChapterLessons() {
  const [activeLesson, setActiveLesson] = useState(0);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.secHead}>
        <Text style={styles.secHeadTitle}>
          <Text style={styles.secNum}>03</Text> — Sacred Craft
        </Text>
        <View style={styles.secRule} />
        <Text style={styles.secJp}>手業</Text>
      </View>

      {/* Head Copy */}
      <View style={styles.curHead}>
        <Text style={styles.displayHeading}>Five chapters. Ninety minutes. One quiet mind.</Text>
        <Text style={styles.bodyLg}>
          Each chapter is a walk, not a lecture. You arrive at the gate, climb the steps, sit with
          the lantern, and leave with one thing worth keeping.
        </Text>
      </View>

      {/* Basalt Stones & Grass Decorative Silhouette Strip */}
      <View style={styles.silhouetteBar}>
        <Image
          source={ASSETS.basaltStones}
          style={styles.stonesImg}
          resizeMode="contain"
          fadeDuration={0}
        />
        <Image
          source={ASSETS.tallGrass}
          style={styles.grassImg}
          resizeMode="cover"
          fadeDuration={0}
        />
      </View>

      {/* Lessons List */}
      <View style={styles.lessonsList}>
        {lessons.map((les, idx) => {
          const isActive = activeLesson === idx;

          return (
            <TouchableOpacity
              key={les.num}
              style={[styles.lessonCard, isActive && styles.lessonCardActive]}
              onPress={() => setActiveLesson(idx)}
              activeOpacity={0.8}
            >
              <View style={styles.lessonTopRow}>
                <View style={styles.numBadge}>
                  <Text style={[styles.lessonNum, isActive && styles.lessonNumActive]}>
                    {les.num}
                  </Text>
                </View>
                <View style={styles.titleWrap}>
                  <View style={styles.titleLine}>
                    <Text style={styles.lessonTitle}>{les.title}</Text>
                    <Text style={styles.lessonJp}>{les.jp}</Text>
                  </View>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{les.time}</Text>
                </View>
              </View>

              <Text style={styles.lessonDesc}>{les.desc}</Text>

              {/* Expanded detail when active */}
              {isActive && (
                <View style={styles.activeDetailWrap}>
                  <Text style={styles.activeDetailText}>{les.detail}</Text>
                </View>
              )}

              {/* Progress Ember Bar */}
              <View style={styles.barTrack}>
                <View style={[styles.barFill, isActive && styles.barFillActive]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 36,
  },
  secHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  secHeadTitle: {
    color: THEME.colors.bone,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  secNum: {
    color: THEME.colors.vermilion,
    fontWeight: '700',
  },
  secRule: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.lineSoft,
  },
  secJp: {
    color: THEME.colors.boneDim,
    fontSize: 14,
    opacity: 0.7,
  },
  curHead: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  displayHeading: {
    color: THEME.colors.boneBright,
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  bodyLg: {
    color: '#b4bfb7',
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '300',
  },
  silhouetteBar: {
    height: 48,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  stonesImg: {
    position: 'absolute',
    left: 20,
    bottom: -10,
    width: 130,
    height: 60,
    opacity: 0.35,
  },
  grassImg: {
    position: 'absolute',
    right: 0,
    bottom: -15,
    width: 140,
    height: 60,
    opacity: 0.35,
  },
  lessonsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  lessonCard: {
    backgroundColor: 'rgba(8, 12, 16, 0.65)',
    borderWidth: 1,
    borderColor: THEME.colors.line,
    borderRadius: THEME.radius.md,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  lessonCardActive: {
    borderColor: 'rgba(226, 38, 30, 0.45)',
    backgroundColor: 'rgba(14, 20, 26, 0.85)',
  },
  lessonTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.lineSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNum: {
    color: THEME.colors.boneDim,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  lessonNumActive: {
    color: THEME.colors.vermilion,
  },
  titleWrap: {
    flex: 1,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  lessonTitle: {
    color: THEME.colors.boneBright,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  lessonJp: {
    color: THEME.colors.boneDim,
    fontSize: 13,
    opacity: 0.6,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  timeText: {
    color: THEME.colors.boneDim,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  lessonDesc: {
    color: '#8e9c93',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '300',
    paddingLeft: 40,
    marginBottom: 10,
  },
  activeDetailWrap: {
    marginLeft: 40,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.lineSoft,
    marginBottom: 8,
  },
  activeDetailText: {
    color: '#c2ccc5',
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  barTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    width: '12%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  barFillActive: {
    width: '100%',
    backgroundColor: THEME.colors.vermilion,
  },
});

export default React.memo(ChapterLessons);

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  useAnimatedValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../theme';
import { ASSETS } from '../assets';

// Static chapter content is independent of component state.
const chapters = [
  {
    num: '01',
    title: 'Thresholds',
    desc: 'Discover the hidden gates that open on to deeper paths.',
    target: 'gate',
  },
  {
    num: '02',
    title: 'Still Gardens',
    desc: 'Witness the courts where silence gently unfolds.',
    target: 'pathways',
  },
  {
    num: '03',
    title: 'Sacred Craft',
    desc: 'Embrace the hands and heritage that shape devotion.',
    target: 'lessons',
  },
  {
    num: '04',
    title: 'Night Rituals',
    desc: 'Explore the rites that awaken when the day is done.',
    target: 'eternity',
  },
];

function Hero({ onSelectChapter, onOpenPreview }) {
  const cueAnim = useAnimatedValue(0);

  useEffect(() => {
    const cue = Animated.loop(
      Animated.sequence([
        Animated.timing(cueAnim, {
          toValue: 8,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(cueAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    cue.start();
    return () => cue.stop();
  }, [cueAnim]);

  return (
    <View style={styles.container}>
      {/* Background Watermark Kanji & English */}
      <View style={styles.watermarkKanji} pointerEvents="none">
        <Text style={styles.kanjiVertical}>
          影{'\n'}の{'\n'}道
        </Text>
      </View>

      {/* Top Header Eyebrow */}
      <View style={styles.heroTop}>
        <View style={styles.eyebrowBadge}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>Chapter 00 — The Hidden Gate</Text>
        </View>

        {/* Display Title */}
        <Text style={styles.displayTitle}>
          WHERE STILLNESS{'\n'}
          REVEALS THE{'\n'}
          <Text style={styles.highlightText}>UNSEEN.</Text>
        </Text>

        <Text style={styles.heroSub}>
          Enter Kyoto through its quiet thresholds, where ritual, craft, and memory shape the path.
        </Text>
      </View>

      {/* Featured Sanmon Preview Artwork Card */}
      <TouchableOpacity
        style={styles.previewCard}
        onPress={() =>
          onOpenPreview &&
          onOpenPreview({
            title: 'Sanmon — Before the Bell',
            subtitle: 'Threshold of the Mountain Temple',
            chapter: 'Chapter 00 — Preview',
            jp: '山門',
            image: ASSETS.sanmonPreview,
            description:
              'The great two-story Sanmon gate stands silent in the pre-dawn mountain air. Before the heavy bronze bell sounds the dawn hour, dew gathers on charred cedar beams and worn granite steps.',
            quote:
              'To cross a threshold is not to change places, but to change how you look at what was always there.',
          })
        }
        activeOpacity={0.88}
      >
        <View style={styles.previewShell}>
          <Image
            source={ASSETS.sanmonPreview}
            style={styles.previewImage}
            resizeMode="cover"
            fadeDuration={0}
          />
          <LinearGradient
            colors={['transparent', 'rgba(4,6,8,0.4)', 'rgba(4,6,8,0.92)']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.playBadge}>
            <View style={styles.playIconCircle}>
              <Text style={styles.playTriangle}>▶</Text>
            </View>
          </View>

          <View style={styles.previewMeta}>
            <Text style={styles.previewJp}>山門</Text>
            <Text style={styles.previewCaption}>Sanmon — before the bell</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Chapter Chips Grid */}
      <View style={styles.chipsSection}>
        <View style={styles.chipsSectionHeader}>
          <Text style={styles.chipsSectionTitle}>EXPERIENCE PATHWAYS</Text>
          <View style={styles.chipsLine} />
        </View>

        <View style={styles.chipsGrid}>
          {chapters.map((ch) => (
            <TouchableOpacity
              key={ch.num}
              style={styles.chipCard}
              onPress={() => onSelectChapter && onSelectChapter(ch.target)}
              activeOpacity={0.75}
            >
              <View style={styles.chipNumBox}>
                <Text style={styles.chipNum}>{ch.num}</Text>
              </View>
              <View style={styles.chipContent}>
                <Text style={styles.chipTitle}>{ch.title}</Text>
                <Text style={styles.chipDesc} numberOfLines={2}>
                  {ch.desc}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scroll Down Cue */}
      <View style={styles.cueWrap}>
        <Text style={styles.cueText}>Scroll to enter</Text>
        <Animated.View style={[styles.cueLineTrack, { transform: [{ translateY: cueAnim }] }]}>
          <View style={styles.cueLineDot} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    position: 'relative',
  },
  watermarkKanji: {
    position: 'absolute',
    top: 40,
    right: 12,
    opacity: 0.04,
  },
  kanjiVertical: {
    color: THEME.colors.bone,
    fontSize: 78,
    fontWeight: '300',
    lineHeight: 88,
  },
  heroTop: {
    marginBottom: 28,
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.vermilion,
  },
  eyebrowText: {
    color: THEME.colors.boneDim,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  displayTitle: {
    color: THEME.colors.boneBright,
    fontSize: 34,
    fontWeight: '400',
    letterSpacing: -0.6,
    lineHeight: 40,
    marginBottom: 16,
  },
  highlightText: {
    color: THEME.colors.bone,
    fontWeight: '700',
  },
  heroSub: {
    color: '#9aa5a0',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '300',
  },
  previewCard: {
    marginBottom: 32,
  },
  previewShell: {
    height: 220,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    backgroundColor: THEME.colors.ink2,
    borderWidth: 1,
    borderColor: THEME.colors.lineBright,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  playIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(6, 10, 14, 0.72)',
    borderWidth: 1,
    borderColor: THEME.colors.lineBright,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    color: THEME.colors.bone,
    fontSize: 12,
    marginLeft: 2,
  },
  previewMeta: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  previewJp: {
    color: THEME.colors.boneBright,
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 1.5,
  },
  previewCaption: {
    color: THEME.colors.boneDim,
    fontSize: 12,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  chipsSection: {
    marginBottom: 32,
  },
  chipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  chipsSectionTitle: {
    color: THEME.colors.vermilion,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.2,
  },
  chipsLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.lineSoft,
  },
  chipsGrid: {
    gap: 10,
  },
  chipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 16, 22, 0.65)',
    borderWidth: 1,
    borderColor: THEME.colors.line,
    borderRadius: THEME.radius.md,
    padding: 14,
    gap: 14,
  },
  chipNumBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(226, 38, 30, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(226, 38, 30, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipNum: {
    color: THEME.colors.vermilion,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  chipContent: {
    flex: 1,
  },
  chipTitle: {
    color: THEME.colors.boneBright,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  chipDesc: {
    color: THEME.colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  cueWrap: {
    alignItems: 'center',
    paddingTop: 10,
    gap: 8,
  },
  cueText: {
    color: THEME.colors.boneDim,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cueLineTrack: {
    width: 1,
    height: 22,
    backgroundColor: THEME.colors.lineSoft,
    alignItems: 'center',
  },
  cueLineDot: {
    width: 3,
    height: 7,
    borderRadius: 2,
    backgroundColor: THEME.colors.vermilion,
  },
});

export default React.memo(Hero);

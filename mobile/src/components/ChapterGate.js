import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../theme';
import { ASSETS } from '../assets';

const { width } = Dimensions.get('window');

// Static chapter content is independent of component state.
const stats = [
  { num: '05', label: 'Chapters' },
  { num: '92', label: 'Minutes' },
  { num: '1611', label: 'Hall raised' },
  { num: '∞', label: 'Stillness' },
];

function ChapterGate({ onCrossThreshold }) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.secHead}>
        <Text style={styles.secHeadTitle}>
          <Text style={styles.secNum}>01</Text> — The Sanmon
        </Text>
        <View style={styles.secRule} />
        <Text style={styles.secJp}>山門</Text>
      </View>

      {/* Layered Silhouettes Silhouette Showcase */}
      <View style={styles.silhouetteStage}>
        {/* Deep ambient mist behind silhouette */}
        <LinearGradient
          colors={['rgba(226,38,30,0.12)', 'rgba(8,12,16,0.85)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Temple wall silhouette layer */}
        <Image
          source={ASSETS.templeWall}
          style={styles.fgWall}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Pine tree silhouette layer */}
        <Image
          source={ASSETS.pineTree}
          style={styles.fgPine}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Tall grass foreground layer */}
        <Image
          source={ASSETS.tallGrass}
          style={styles.fgGrass}
          resizeMode="cover"
          fadeDuration={0}
        />

        {/* Bottom fade */}
        <LinearGradient colors={['transparent', THEME.colors.ink]} style={styles.stageFadeBottom} />
      </View>

      {/* Chapter Content Grid */}
      <View style={styles.contentWrap}>
        <Text style={styles.displayHeading}>Charred cypress, worn stone, one gate left open.</Text>

        <Text style={styles.leadText}>
          Kage begins where the city stops: a mountain gate of cedar burned black, standing in its
          own weather. The soot is not decoration. It is how a board is taught to survive a hundred
          rainy seasons, and the first thing this place asks you to understand.
        </Text>

        <Text style={styles.bodyText}>
          Climb the worn steps and the worship hall lifts out of the mist, its paper screens lit
          from inside like a lantern the size of a house. Above the eaves a vermilion moon holds its
          place, patient, half hidden. Nothing here is in a hurry. Neither, for the next ninety
          minutes, are you.
        </Text>

        {/* Arrow Link Button */}
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => onCrossThreshold && onCrossThreshold('pathways')}
          activeOpacity={0.8}
        >
          <Text style={styles.arrowBtnText}>Cross the threshold</Text>
          <View style={styles.arrowIconWrap}>
            <Text style={styles.arrowIcon}>↗</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Gate Stats Matrix */}
      <View style={styles.statsContainer}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statBox}>
            <Text style={styles.statNum}>{item.num}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
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
  silhouetteStage: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: 'rgba(6, 10, 14, 0.4)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  fgWall: {
    position: 'absolute',
    left: -20,
    bottom: -10,
    width: width * 0.7,
    height: 170,
    opacity: 0.85,
  },
  fgPine: {
    position: 'absolute',
    right: -10,
    bottom: 0,
    width: width * 0.5,
    height: 210,
    opacity: 0.85,
  },
  fgGrass: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -15,
    width: '100%',
    height: 90,
    opacity: 0.9,
  },
  stageFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  contentWrap: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  displayHeading: {
    color: THEME.colors.boneBright,
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  leadText: {
    color: '#c2ccc5',
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '300',
    marginBottom: 14,
  },
  bodyText: {
    color: '#8e9c93',
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '300',
    marginBottom: 22,
  },
  arrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  arrowBtnText: {
    color: THEME.colors.bone,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  arrowIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    color: THEME.colors.boneBright,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    backgroundColor: 'rgba(8, 12, 16, 0.75)',
    borderWidth: 1,
    borderColor: THEME.colors.line,
    borderRadius: THEME.radius.lg,
    padding: 16,
  },
  statBox: {
    width: '50%',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statNum: {
    color: THEME.colors.boneBright,
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: -0.5,
    marginBottom: 2,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: THEME.colors.boneDim,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

export default React.memo(ChapterGate);

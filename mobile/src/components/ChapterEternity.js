import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../theme';
import { ASSETS } from '../assets';

const { width } = Dimensions.get('window');

function ChapterEternity({ onBeginWalk }) {
  return (
    <View style={styles.container}>
      {/* Decorative Closing Horizon Silhouettes */}
      <View style={styles.horizonStage}>
        {/* Hill backdrop */}
        <Image source={ASSETS.hill} style={styles.fgHill} resizeMode="contain" fadeDuration={0} />

        {/* Shrine ruins */}
        <Image
          source={ASSETS.shrineRuins}
          style={styles.fgRuins}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Sakura branch hanging from top */}
        <Image
          source={ASSETS.sakuraBranch}
          style={styles.fgSakura}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Grass bottom line */}
        <Image
          source={ASSETS.tallGrass}
          style={styles.fgGrass}
          resizeMode="cover"
          fadeDuration={0}
        />

        {/* Atmospheric mist */}
        <LinearGradient
          colors={['transparent', 'rgba(4,6,8,0.7)', THEME.colors.ink]}
          style={styles.mistFade}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.eyebrowBadge}>
          <Text style={styles.eyebrowText}>Chapter 04 — Afterlight</Text>
        </View>

        <Text style={styles.displayHeading}>Afterlight</Text>

        <Text style={styles.bodyLg}>
          The gate does not close behind you. Take the walk whenever the noise gets loud — it is
          always the same path, and never the same light.
        </Text>

        {/* Primary High-End Nested Button-in-Button CTA */}
        <TouchableOpacity style={styles.ctaOuter} onPress={onBeginWalk} activeOpacity={0.88}>
          <LinearGradient
            colors={['#e2261e', '#a31610']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaInner}
          >
            <View style={styles.ctaLeft}>
              <View style={styles.ctaEmberDot} />
              <Text style={styles.ctaLabel}>Begin the walk</Text>
            </View>

            <View style={styles.ctaIconCircle}>
              <Text style={styles.ctaIcon}>↗</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingBottom: 48,
    position: 'relative',
  },
  horizonStage: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: 'rgba(6, 10, 14, 0.3)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  fgHill: {
    position: 'absolute',
    left: -20,
    bottom: 20,
    width: width * 0.9,
    height: 120,
    opacity: 0.5,
  },
  fgRuins: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: width * 0.6,
    height: 160,
    opacity: 0.65,
  },
  fgSakura: {
    position: 'absolute',
    left: -15,
    top: -10,
    width: 170,
    height: 100,
    opacity: 0.45,
  },
  fgGrass: {
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
    width: '100%',
    height: 80,
    opacity: 0.85,
  },
  mistFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  content: {
    paddingHorizontal: 22,
    alignItems: 'center',
    textAlign: 'center',
  },
  eyebrowBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.lineSoft,
    marginBottom: 16,
  },
  eyebrowText: {
    color: THEME.colors.boneDim,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  displayHeading: {
    color: THEME.colors.boneBright,
    fontSize: 34,
    fontWeight: '400',
    letterSpacing: -0.6,
    marginBottom: 14,
    textAlign: 'center',
  },
  bodyLg: {
    color: '#b4bfb7',
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 320,
  },
  ctaOuter: {
    borderRadius: THEME.radius.pill,
    overflow: 'hidden',
    shadowColor: '#e2261e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingLeft: 22,
    paddingRight: 10,
    gap: 20,
    borderRadius: THEME.radius.pill,
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaEmberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  ctaIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default React.memo(ChapterEternity);

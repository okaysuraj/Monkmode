import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, useAnimatedValue, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ToriiLogo from './ToriiLogo';
import { THEME } from '../theme';

const { width } = Dimensions.get('window');

function Preloader({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const fadeAnim = useAnimatedValue(1);
  const pulseAnim = useAnimatedValue(1);
  const progressAnim = useAnimatedValue(0);

  useEffect(() => {
    // Pulse animation on the mark
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    // Progress counter simulation
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 14) + 6;
        return Math.min(100, prev + step);
      });
    }, 90);

    return () => {
      pulse.stop();
      clearInterval(interval);
    };
  }, [pulseAnim]);

  useEffect(() => {
    const progress = Animated.timing(progressAnim, {
      toValue: percent,
      duration: 120,
      useNativeDriver: true,
    });
    progress.start();

    if (percent === 100) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) onComplete?.();
        });
      }, 350);
      return () => {
        clearTimeout(timer);
        progress.stop();
        fadeAnim.stopAnimation();
      };
    }
    return () => progress.stop();
  }, [percent, fadeAnim, onComplete, progressAnim]);

  const barTranslateX = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [-width * 0.82, 0],
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="auto"
    >
      <LinearGradient colors={['#040608', '#080c10', '#040608']} style={StyleSheet.absoluteFill} />

      {/* Radial soft glow */}
      <View style={styles.haloGlow} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <ToriiLogo size={48} />
        </Animated.View>

        <Text style={styles.kanji}>影の道</Text>

        {/* Progress bar container */}
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { transform: [{ translateX: barTranslateX }] }]}>
            <LinearGradient
              colors={['#ff6442', '#e2261e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* Meta info */}
        <View style={styles.metaRow}>
          <View style={styles.statusWrap}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Raising the mountain temple</Text>
          </View>
          <Text style={styles.pctText}>{percent}%</Text>
        </View>

        <Text style={styles.sublabel}>Kyoto Sanctuary · Mobile Experience</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.ink,
  },
  haloGlow: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(226, 38, 30, 0.08)',
  },
  content: {
    width: width * 0.82,
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: THEME.colors.lineSoft,
  },
  kanji: {
    color: THEME.colors.bone,
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 4,
    marginBottom: 26,
    opacity: 0.9,
  },
  barTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  barFill: {
    width: '100%',
    height: '100%',
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.vermilion,
  },
  statusText: {
    color: THEME.colors.boneDim,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  pctText: {
    color: THEME.colors.bone,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sublabel: {
    color: THEME.colors.muted,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});

export default React.memo(Preloader);

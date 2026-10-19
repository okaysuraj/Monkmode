import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, useAnimatedValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../theme';

const { width } = Dimensions.get('window');

function Atmosphere() {
  const pulseAnim = useAnimatedValue(0.4);
  const floatAnim = useAnimatedValue(0);

  useEffect(() => {
    // Gentle breathing pulse for the moon glow
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 4800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 4800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    // Subtle drift
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 6500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 6500,
          useNativeDriver: true,
        }),
      ]),
    );
    drift.start();

    return () => {
      pulse.stop();
      drift.stop();
    };
  }, [pulseAnim, floatAnim]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base deep obsidian fill */}
      <View style={styles.baseBg} />

      {/* Atmospheric vermilion moon glow */}
      <Animated.View
        style={[
          styles.moonGlowContainer,
          {
            opacity: pulseAnim,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(226,38,30,0.22)', 'rgba(212,56,38,0.08)', 'transparent']}
          style={styles.moonGlow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Golden ember ambient haze on bottom */}
      <View style={styles.goldenHaze}>
        <LinearGradient
          colors={['transparent', 'rgba(212,175,55,0.03)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Vignette top and bottom shadows */}
      <LinearGradient colors={['rgba(4,6,8,0.85)', 'transparent']} style={styles.vignetteTop} />
      <LinearGradient colors={['transparent', 'rgba(4,6,8,0.92)']} style={styles.vignetteBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  baseBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: THEME.colors.ink,
  },
  moonGlowContainer: {
    position: 'absolute',
    top: 60,
    right: -width * 0.25,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: (width * 1.1) / 2,
    overflow: 'hidden',
  },
  moonGlow: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 1.1) / 2,
  },
  goldenHaze: {
    position: 'absolute',
    bottom: '25%',
    left: 0,
    right: 0,
    height: 400,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
});

export default React.memo(Atmosphere);

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ToriiLogo from './ToriiLogo';
import { THEME } from '../theme';
import { ASSETS } from '../assets';

function Footer({ onNavigate }) {
  const chapters = [
    { title: 'The Sanmon', target: 'gate' },
    { title: 'Still Gardens', target: 'pathways' },
    { title: 'Sacred Craft', target: 'lessons' },
    { title: 'Afterlight', target: 'eternity' },
  ];

  const practices = [
    'Borrowed scenery (借景)',
    'Lantern light (灯籠)',
    'Charred cypress (焼杉)',
    'Raked gravel (枯山水)',
  ];

  const elsewhere = ['Journal', 'Field notes', 'Colophon'];

  return (
    <View style={styles.container}>
      {/* Decorative Garden Planting Layer */}
      <View style={styles.foliageStrip}>
        <Image
          source={ASSETS.gardenBush}
          style={styles.bushImg}
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

      <View style={styles.mainContent}>
        {/* Brand statement */}
        <View style={styles.brandRow}>
          <ToriiLogo size={36} />
          <Text style={styles.missionText}>
            A five-chapter night walk through a Kyoto mountain temple. Three illustrated garden
            field notes sit inside a live sanctuary.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Links Grid */}
        <View style={styles.linksGrid}>
          {/* Column 1: Chapters */}
          <View style={styles.linkCol}>
            <Text style={styles.colTitle}>Chapters</Text>
            {chapters.map((ch) => (
              <TouchableOpacity
                key={ch.title}
                onPress={() => onNavigate && onNavigate(ch.target)}
                activeOpacity={0.7}
                style={styles.linkItem}
              >
                <Text style={styles.linkText}>{ch.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Column 2: Practice */}
          <View style={styles.linkCol}>
            <Text style={styles.colTitle}>Practice</Text>
            {practices.map((pr) => (
              <View key={pr} style={styles.linkItem}>
                <Text style={styles.linkTextMuted}>{pr}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Elsewhere */}
        <View style={styles.elsewhereRow}>
          <Text style={styles.colTitleSmall}>Elsewhere</Text>
          <View style={styles.elsewherePills}>
            {elsewhere.map((item) => (
              <View key={item} style={styles.pillItem}>
                <Text style={styles.pillText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Colophon & Copyright */}
        <View style={styles.colophon}>
          <Text style={styles.copy}>© 2026 Kage — Kage no Michi</Text>
          <Text style={styles.philosophyJp}>静けさは一つの技である</Text>
          <Text style={styles.techTag}>React Native · Expo 57 · Kyoto</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#030507',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.lineSoft,
    paddingBottom: 40,
  },
  foliageStrip: {
    height: 40,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  bushImg: {
    position: 'absolute',
    left: 10,
    bottom: -15,
    width: 130,
    height: 60,
    opacity: 0.35,
  },
  grassImg: {
    position: 'absolute',
    right: 0,
    bottom: -12,
    width: 140,
    height: 50,
    opacity: 0.35,
  },
  mainContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  brandRow: {
    gap: 16,
    marginBottom: 20,
  },
  missionText: {
    color: '#8e9c93',
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.lineSoft,
    marginVertical: 18,
  },
  linksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  linkCol: {
    flex: 1,
    gap: 10,
  },
  colTitle: {
    color: THEME.colors.bone,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  colTitleSmall: {
    color: THEME.colors.bone,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  linkItem: {
    paddingVertical: 2,
  },
  linkText: {
    color: '#a2aea6',
    fontSize: 13,
    fontWeight: '300',
  },
  linkTextMuted: {
    color: '#65736b',
    fontSize: 12,
    fontWeight: '300',
  },
  elsewhereRow: {
    marginBottom: 6,
  },
  elsewherePills: {
    flexDirection: 'row',
    gap: 8,
  },
  pillItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: THEME.colors.lineSoft,
  },
  pillText: {
    color: '#8e9c93',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  colophon: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  copy: {
    color: THEME.colors.muted,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  philosophyJp: {
    color: THEME.colors.boneDim,
    fontSize: 13,
    letterSpacing: 1.8,
    opacity: 0.65,
  },
  techTag: {
    color: THEME.colors.muted,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default React.memo(Footer);

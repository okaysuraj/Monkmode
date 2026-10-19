import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../theme';
import { ASSETS } from '../assets';

const { width } = Dimensions.get('window');

// Static chapter content is independent of component state.
const cards = [
  {
    id: 'approach',
    title: 'Approach',
    subtitle: 'The Long Climb',
    index: '01 / 03',
    jp: '参道',
    chapter: 'Chapter 02 — Still Gardens',
    image: ASSETS.approach,
    glowColor: 'rgba(255, 142, 108, 0.45)',
    description:
      'Worn stone steps flanked by ancient cedars and deep moss leading upwards into the shrouded mountain sanctuary. The ascent slows your breathing, attuning your senses to the quiet drip of mountain rain.',
    quote:
      'The approach is never about arriving quickly; it is about leaving the city behind with every deliberate step.',
  },
  {
    id: 'lanterns',
    title: 'Lanterns',
    subtitle: 'Lantern Court',
    index: '02 / 03',
    jp: '灯籠',
    chapter: 'Chapter 02 — Still Gardens',
    image: ASSETS.lanternCourt,
    glowColor: 'rgba(255, 198, 124, 0.55)',
    description:
      'Carved granite toro holding warm solitary flames. In the obsidian darkness, a single ember creates an entire world of shadows, revealing the quiet texture of damp timber and raked gravel.',
    quote:
      'Darkness is not the absence of light; it is the canvas upon which quiet illumination speaks.',
  },
  {
    id: 'moonwater',
    title: 'Moonwater',
    subtitle: 'The Wet Court',
    index: '03 / 03',
    jp: '月影',
    chapter: 'Chapter 02 — Still Gardens',
    image: ASSETS.moonwater,
    glowColor: 'rgba(226, 38, 30, 0.45)',
    description:
      'A mirror-still reflecting court holding the vermilion moon and maple branch silhouettes. When the breeze halts, sky and earth dissolve into a single unmoving plane of obsidian glass.',
    quote:
      'Still water does not resist the reflection of the moon; it simply holds it without desire.',
  },
];

function ChapterPathways({ onSelectCard }) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.secHead}>
        <Text style={styles.secHeadTitle}>
          <Text style={styles.secNum}>02</Text> — Still Gardens
        </Text>
        <View style={styles.secRule} />
        <Text style={styles.secJp}>庭園</Text>
      </View>

      {/* Decorative Garden Silhouettes Strip */}
      <View style={styles.gardenFoliageBar}>
        <Image
          source={ASSETS.sakuraBranch}
          style={styles.foliageBranch}
          resizeMode="contain"
          fadeDuration={0}
        />
        <Image
          source={ASSETS.stoneLantern}
          style={styles.foliageLantern}
          resizeMode="contain"
          fadeDuration={0}
        />
        <Image
          source={ASSETS.mapleLeaves}
          style={styles.foliageLeaves}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>

      {/* Cards List */}
      <View style={styles.cardsContainer}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardShell}
            onPress={() => onSelectCard && onSelectCard(card)}
            activeOpacity={0.85}
          >
            <View style={styles.cardFrame}>
              <Image
                source={card.image}
                style={styles.cardImage}
                resizeMode="cover"
                fadeDuration={0}
              />

              <LinearGradient
                colors={['transparent', 'rgba(4,6,8,0.3)', 'rgba(4,6,8,0.92)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Glowing Lantern Orb */}
              <View style={[styles.glowOrb, { backgroundColor: card.glowColor }]} />

              {/* Arrow Indicator Top Right */}
              <View style={styles.cardArrow}>
                <Text style={styles.arrowChar}>↗</Text>
              </View>

              {/* Card Label Bottom */}
              <View style={styles.cardLabelWrap}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardJp}>{card.jp}</Text>
              </View>
            </View>

            {/* Card Metadata Strip */}
            <View style={styles.cardMeta}>
              <Text style={styles.metaSub}>{card.subtitle}</Text>
              <Text style={styles.metaIdx}>{card.index}</Text>
            </View>
          </TouchableOpacity>
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
  gardenFoliageBar: {
    height: 60,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  foliageBranch: {
    position: 'absolute',
    left: -10,
    top: -10,
    width: 140,
    height: 70,
    opacity: 0.45,
  },
  foliageLantern: {
    position: 'absolute',
    left: width * 0.45,
    top: 5,
    width: 45,
    height: 65,
    opacity: 0.5,
  },
  foliageLeaves: {
    position: 'absolute',
    right: -10,
    top: -5,
    width: 130,
    height: 70,
    opacity: 0.45,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 22,
  },
  cardShell: {
    backgroundColor: 'rgba(10, 16, 22, 0.65)',
    borderWidth: 1,
    borderColor: THEME.colors.lineBright,
    borderRadius: THEME.radius.lg,
    padding: 10,
    overflow: 'hidden',
  },
  cardFrame: {
    height: 200,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: THEME.colors.ink2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  glowOrb: {
    position: 'absolute',
    right: 28,
    top: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.7,
  },
  cardArrow: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(6, 10, 14, 0.72)',
    borderWidth: 1,
    borderColor: THEME.colors.lineBright,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowChar: {
    color: THEME.colors.bone,
    fontSize: 13,
  },
  cardLabelWrap: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: THEME.colors.boneBright,
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  cardJp: {
    color: THEME.colors.boneDim,
    fontSize: 18,
    letterSpacing: 1,
    opacity: 0.8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 2,
  },
  metaSub: {
    color: THEME.colors.boneDim,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  metaIdx: {
    color: THEME.colors.vermilion,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});

export default React.memo(ChapterPathways);

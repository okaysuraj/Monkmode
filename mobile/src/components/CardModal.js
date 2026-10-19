import React from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../theme';

function CardModal({ visible, item, onClose }) {
  if (!item) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <LinearGradient
          colors={['rgba(4,6,8,0.95)', 'rgba(8,12,16,0.98)']}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.header}>
            <View style={styles.chapterBadge}>
              <View style={styles.dot} />
              <Text style={styles.chapterText}>{item.chapter || 'FIELD NOTE'}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Artwork Container */}
            <View style={styles.artFrame}>
              <Image
                source={item.image}
                style={styles.artImage}
                resizeMode="cover"
                fadeDuration={0}
              />
              <LinearGradient
                colors={['transparent', 'rgba(4,6,8,0.85)']}
                style={styles.imageFade}
              />
              <View style={styles.artOverlay}>
                <Text style={styles.jpCallout}>{item.jp}</Text>
                <Text style={styles.indexTag}>{item.index || '01 / 03'}</Text>
              </View>
            </View>

            {/* Content Details */}
            <View style={styles.detailBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              <View style={styles.divider} />

              <Text style={styles.description}>{item.description}</Text>

              {item.quote && (
                <View style={styles.quoteBox}>
                  <View style={styles.quoteBar} />
                  <Text style={styles.quoteText}>{item.quote}</Text>
                </View>
              )}

              {/* Close / Return Button */}
              <TouchableOpacity style={styles.actionBtn} onPress={onClose} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#e2261e', '#b81d16']}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.btnText}>Return to Sanctuary</Text>
                  <View style={styles.btnIconWrap}>
                    <Text style={styles.btnIcon}>↗</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.colors.ink,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.lineSoft,
  },
  chapterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.vermilion,
  },
  chapterText: {
    color: THEME.colors.boneDim,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: THEME.colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: THEME.colors.bone,
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  artFrame: {
    width: '100%',
    height: 280,
    backgroundColor: THEME.colors.ink2,
    position: 'relative',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  imageFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  artOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  jpCallout: {
    color: THEME.colors.boneBright,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  indexTag: {
    color: THEME.colors.boneDim,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  detailBody: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  title: {
    color: THEME.colors.boneBright,
    fontSize: 26,
    fontWeight: '400',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: THEME.colors.vermilion,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.lineSoft,
    marginVertical: 18,
  },
  description: {
    color: '#b4bfb7',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '300',
    marginBottom: 20,
  },
  quoteBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: THEME.colors.lineSoft,
    gap: 12,
  },
  quoteBar: {
    width: 2,
    backgroundColor: THEME.colors.vermilion,
    borderRadius: 1,
  },
  quoteText: {
    flex: 1,
    color: THEME.colors.boneDim,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionBtn: {
    borderRadius: THEME.radius.pill,
    overflow: 'hidden',
    marginTop: 8,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  btnIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default React.memo(CardModal);

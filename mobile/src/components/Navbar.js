import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ToriiLogo from './ToriiLogo';
import { THEME } from '../theme';

function Navbar({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkPress = (targetId) => {
    setMenuOpen(false);
    onNavigate?.(targetId);
  };

  return (
    <>
      <View style={styles.navWrapper}>
        <View style={styles.navShell}>
          <TouchableOpacity
            style={styles.brand}
            onPress={() => handleLinkPress('hero')}
            activeOpacity={0.8}
          >
            <ToriiLogo size={28} />
            <View style={styles.brandTx}>
              <Text style={styles.brandTitle} numberOfLines={1}>
                MONKMODE
              </Text>
              <Text style={styles.brandSub} numberOfLines={1}>
                HIDDEN REALMS OF KYOTO
              </Text>
            </View>
          </TouchableOpacity>

          {/* Burger menu button */}
          <TouchableOpacity
            style={styles.burgerBtn}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.burgerInner}>
              <View style={styles.burgerLineTop} />
              <View style={styles.burgerLineBottom} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Modal Drawer */}
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <LinearGradient
            colors={['rgba(4,6,8,0.96)', 'rgba(8,12,16,0.98)']}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom', 'left', 'right']}>
            {/* Header in Modal */}
            <View style={styles.modalHeader}>
              <View style={styles.brand}>
                <ToriiLogo size={28} />
                <View style={styles.brandTx}>
                  <Text style={styles.brandTitle} numberOfLines={1}>
                    MONKMODE
                  </Text>
                  <Text style={styles.brandSub} numberOfLines={1}>
                    HIDDEN REALMS OF KYOTO
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setMenuOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Navigation Chapter List */}
            <View style={styles.menuLinks}>
              <Text style={styles.menuEyebrow}>SANCTUARY INDEX</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleLinkPress('gate')}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.menuNum}>01</Text>
                  <Text style={styles.menuTitle}>Temples</Text>
                </View>
                <Text style={styles.menuJp}>伽藍</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleLinkPress('pathways')}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.menuNum}>02</Text>
                  <Text style={styles.menuTitle}>Still Gardens</Text>
                </View>
                <Text style={styles.menuJp}>庭園</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleLinkPress('lessons')}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.menuNum}>03</Text>
                  <Text style={styles.menuTitle}>Rituals & Craft</Text>
                </View>
                <Text style={styles.menuJp}>神事</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleLinkPress('eternity')}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.menuNum}>04</Text>
                  <Text style={styles.menuTitle}>Afterlight</Text>
                </View>
                <Text style={styles.menuJp}>残光</Text>
              </TouchableOpacity>
            </View>

            {/* Footer note inside menu */}
            <View style={styles.modalFoot}>
              <Text style={styles.modalFootJp}>影の道 · 静けさは一つの技である</Text>
              <Text style={styles.modalFootNote}>Kyoto Sanctuary Experience</Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 50,
  },
  navShell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 16, 22, 0.72)',
    borderWidth: 1,
    borderColor: THEME.colors.lineBright,
    borderRadius: THEME.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  brandTx: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitle: {
    color: THEME.colors.boneBright,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.2,
  },
  brandSub: {
    color: THEME.colors.boneDim,
    fontSize: 7.5,
    fontWeight: '400',
    letterSpacing: 1.1,
    opacity: 0.8,
  },
  burgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  burgerInner: {
    width: 18,
    height: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  burgerLineTop: {
    width: 18,
    height: 2,
    backgroundColor: THEME.colors.bone,
    borderRadius: 1,
  },
  burgerLineBottom: {
    width: 12,
    height: 2,
    backgroundColor: THEME.colors.bone,
    borderRadius: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: THEME.colors.ink,
  },
  modalSafe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.lineSoft,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: THEME.colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: THEME.colors.bone,
    fontSize: 16,
    fontWeight: '300',
  },
  menuLinks: {
    paddingVertical: 32,
    gap: 12,
  },
  menuEyebrow: {
    color: THEME.colors.vermilion,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuNum: {
    color: THEME.colors.vermilion,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  menuTitle: {
    color: THEME.colors.boneBright,
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  menuJp: {
    color: THEME.colors.boneDim,
    fontSize: 20,
    opacity: 0.5,
  },
  menuDivider: {
    height: 1,
    backgroundColor: THEME.colors.lineSoft,
  },
  modalFoot: {
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.lineSoft,
    paddingTop: 20,
    gap: 4,
  },
  modalFootJp: {
    color: THEME.colors.boneDim,
    fontSize: 13,
    letterSpacing: 1,
    opacity: 0.7,
  },
  modalFootNote: {
    color: THEME.colors.muted,
    fontSize: 11,
    letterSpacing: 0.8,
  },
});

export default React.memo(Navbar);

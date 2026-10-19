import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

import { THEME } from './src/theme';
import Atmosphere from './src/components/Atmosphere';
import Preloader from './src/components/Preloader';
import Navbar from './src/components/Navbar';
import Hero from './src/components/Hero';
import ChapterGate from './src/components/ChapterGate';
import ChapterPathways from './src/components/ChapterPathways';
import ChapterLessons from './src/components/ChapterLessons';
import ChapterEternity from './src/components/ChapterEternity';
import Footer from './src/components/Footer';
import CardModal from './src/components/CardModal';

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const scrollViewRef = useRef(null);
  const sectionPositions = useRef({});

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleRegisterLayout = useCallback((sectionId, event) => {
    const layout = event.nativeEvent.layout;
    sectionPositions.current[sectionId] = layout.y;
  }, []);

  const handleNavigate = useCallback((sectionId) => {
    if (sectionId === 'hero' || sectionId === 'top') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const targetY = sectionPositions.current[sectionId];
    if (targetY !== undefined) {
      // Offset by roughly navbar height for ideal visibility
      const scrollY = Math.max(0, targetY - 40);
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <Atmosphere />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
          <Navbar onNavigate={handleNavigate} />
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            overScrollMode="never"
          >
            <View onLayout={(e) => handleRegisterLayout('hero', e)}>
              <Hero onSelectChapter={handleNavigate} onOpenPreview={setSelectedCard} />
            </View>
            <View onLayout={(e) => handleRegisterLayout('gate', e)}>
              <ChapterGate onCrossThreshold={handleNavigate} />
            </View>
            <View onLayout={(e) => handleRegisterLayout('pathways', e)}>
              <ChapterPathways onSelectCard={setSelectedCard} />
            </View>
            <View onLayout={(e) => handleRegisterLayout('lessons', e)}>
              <ChapterLessons />
            </View>
            <View onLayout={(e) => handleRegisterLayout('eternity', e)}>
              <ChapterEternity onBeginWalk={() => handleNavigate('hero')} />
            </View>
            <Footer onNavigate={handleNavigate} />
          </ScrollView>
        </SafeAreaView>
        <CardModal visible={!!selectedCard} item={selectedCard} onClose={handleCloseModal} />
        {!preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.ink,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 44,
  },
});

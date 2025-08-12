import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  View,
  Text,
  Dimensions,
  StyleSheet,
  StatusBar,
  AccessibilityInfo,
  Platform,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

const GROCERY_EMOJIS = ['🥦', '🍎', '🥕', '🧅', '🍞', '🥛', '🍌', '🍅'];

export default function MandlimartSplash({
  duration = 2600,
  onFinish,
  title = 'Mandlimart',
  tagline = 'Local groceries, delivered fresh.',
  backgroundColor = '#F6FFF5', // soft green
  primaryColor = '#2E7D32', // green
  accentColor = '#FFB300', // amber
  showLoader = true,
}) {
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  const letters = useMemo(() => title.split(''), [title]);
  const letterAnims = useRef(letters.map(() => new Animated.Value(0))).current;

  const taglineAnim = useRef(new Animated.Value(0)).current;
  const loader = useRef(new Animated.Value(0)).current;

  const RING_SIZE = 180;
  const RING_RADIUS = (RING_SIZE - 20) / 2;
  const ITEMS = 8;

  const items = useMemo(() => {
    const arr = [];
    for (let i = 0; i < ITEMS; i++) {
      const angle = (i / ITEMS) * 2 * Math.PI;
      arr.push({
        key: `g-${i}`,
        emoji: GROCERY_EMOJIS[i % GROCERY_EMOJIS.length],
        x: RING_RADIUS * Math.cos(angle),
        y: RING_RADIUS * Math.sin(angle),
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RING_RADIUS]);

  useEffect(() => {
    let reduceMotion = false;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion = !!enabled;

      // Entrance animations
      const logoIn = Animated.spring(logoScale, {
        toValue: 1,
        damping: 12,
        mass: 1,
        stiffness: 160,
        useNativeDriver: true,
      });

      const lettersIn = Animated.stagger(
        65,
        letters.map((_, i) =>
          Animated.spring(letterAnims[i], {
            toValue: 1,
            damping: 10,
            mass: 0.8,
            stiffness: 140,
            useNativeDriver: true,
          })
        )
      );

      const taglineIn = Animated.timing(taglineAnim, {
        toValue: 1,
        duration: reduceMotion ? 150 : 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

      // Rotation loop
      Animated.loop(
        Animated.timing(ringRotate, {
          toValue: 1,
          duration: reduceMotion ? 2000 : 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Subtle breathing on logo
      if (!reduceMotion) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(logoScale, {
              toValue: 1.03,
              duration: 1000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
              toValue: 1.0,
              duration: 1000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }

      Animated.sequence([Animated.parallel([logoIn, lettersIn, taglineIn])]).start();

      // Loader + finish
      Animated.timing(loader, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // width interpolation requires JS driver
      }).start(({ finished }) => {
        if (finished) {
          Animated.timing(rootOpacity, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            onFinish && onFinish();
          });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, letters.join('')]);

  const ringRotation = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const LETTER_COLORS = [
    '#1B5E20',
    '#2E7D32',
    '#43A047',
    '#66BB6A',
    '#388E3C',
    '#FFB300',
    '#FB8C00',
    '#8D6E63',
    '#5D4037',
  ];

  const BAR_W = Math.min(300, SCREEN_W * 0.75);
  const progressWidth = loader.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_W],
  });

  return (
    <Animated.View
      style={[styles.root, { backgroundColor, opacity: rootOpacity }]}
      accessible
      accessibilityLabel="Mandlimart splash screen"
    >
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
        backgroundColor={backgroundColor}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          {/* Rotating grocery ring + badge */}
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
            <Animated.View
              style={[
                styles.ring,
                { width: RING_SIZE, height: RING_SIZE, borderColor: accentColor, transform: [{ rotate: ringRotation }] },
              ]}
              accessibilityLabel="Rotating ring of groceries"
              accessible
            >
              {items.map((it) => (
                <View
                  key={it.key}
                  style={[
                    styles.grocery,
                    { left: RING_SIZE / 2 + it.x - 12, top: RING_SIZE / 2 + it.y - 12 },
                  ]}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Text style={styles.groceryText}>{it.emoji}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Badge with cart emoji */}
            <View style={[styles.badge, { borderColor: primaryColor }]}>
              <View style={[styles.badgeInner, { backgroundColor: '#E9F7EC' }]} />
              <Text style={[styles.monogram, { color: primaryColor }]}>🛒</Text>
            </View>
          </Animated.View>

          {/* Title letters */}
          <View style={styles.titleRow} accessibilityRole="header">
            {letters.map((ch, i) => {
              const v = letterAnims[i];
              const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
              const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
              const opacity = v;
              const color = LETTER_COLORS[i % LETTER_COLORS.length];
              return (
                <Animated.Text
                  key={`${ch}-${i}`}
                  style={[styles.titleLetter, { color, opacity, transform: [{ translateY }, { scale }] }]}
                >
                  {ch}
                </Animated.Text>
              );
            })}
          </View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                color: '#4A4A4A',
                opacity: taglineAnim,
                transform: [
                  {
                    translateY: taglineAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
                  },
                ],
              },
            ]}
            accessibilityLabel={`Tagline: ${tagline}`}
          >
            {tagline}
          </Animated.Text>

          {/* Loader */}
          {showLoader && (
            <View style={styles.loaderWrap} accessibilityLabel="Loading progress">
              <View style={[styles.loaderTrack, { width: BAR_W, backgroundColor: 'rgba(0,0,0,0.08)' }]}>
                <Animated.View style={[styles.loaderFill, { width: progressWidth, backgroundColor: primaryColor }]} />
                <Animated.View
                  style={[
                    styles.loaderShine,
                    {
                      transform: [
                        {
                          translateX: loader.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-BAR_W, BAR_W],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  ring: { position: 'absolute', borderWidth: 2, borderRadius: 200, opacity: 0.28 },
  grocery: { position: 'absolute', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  groceryText: { fontSize: 18 },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1FAF3',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badgeInner: { position: 'absolute', width: 86, height: 86, borderRadius: 43, opacity: 0.8 },
  monogram: { fontSize: 56, fontWeight: '800' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  titleLetter: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
  tagline: { fontSize: 16, fontWeight: '500', opacity: 0.9 },
  loaderWrap: { marginTop: 10 },
  loaderTrack: { height: 8, borderRadius: 8, overflow: 'hidden' },
  loaderFill: { height: 8, borderRadius: 8 },
  loaderShine: { position: 'absolute', top: 0, bottom: 0, width: 48, backgroundColor: 'rgba(255,255,255,0.45)' },
});
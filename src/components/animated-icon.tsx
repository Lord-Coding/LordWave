import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

export function AnimatedSplashOverlay() {
  const theme = useTheme();
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  const image = (
    <Image
      style={styles.image}
      source={require("@/assets/images/lordwave-logo-white.png")}
      contentFit="contain"
    />
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      <SplashBackground />
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={[styles.splashOverlay, { backgroundColor: theme.primary }]}>
      <SplashBackground />
      {image}
    </View>
  );
}

function SplashBackground() {
  const theme = useTheme();

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 1000 2000"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={theme.tint} />
          <Stop offset="55%" stopColor={theme.primary} />
          <Stop offset="100%" stopColor={theme.shade} />
        </LinearGradient>
      </Defs>
      <Rect width="1000" height="2000" fill="url(#splashGradient)" />
      <Path
        d="M-120 220C35 80 250 115 320 275c85 196-56 287-5 421 48 126-37 233-184 221-120-9-197-102-262-60V220Z"
        fill={theme.tint}
        opacity={0.28}
      />
      <Path
        d="M1035 1150c-137-79-284-52-330 66-57 145 61 227-15 351-80 131-21 270 119 292 95 15 153-46 226-28V1150Z"
        fill={theme.shade}
        opacity={0.36}
      />
      <Circle cx="865" cy="350" r="220" fill={theme.tint} opacity={0.12} />
      <Ellipse cx="120" cy="1500" rx="255" ry="180" fill={theme.primary} opacity={0.2} />
    </Svg>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image
          style={styles.image}
          source={require("@/assets/images/lordwave-logo-white.png")}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 96,
    height: 96,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #ffb347, #e0962d)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffaa33',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});


import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

type SelectedTrack = {
  name: string;
  uri: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;
}

export default function HomeScreen() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [track, setTrack] = useState<SelectedTrack | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch((error) => {
      console.error('Erreur de configuration audio :', error);
    });

    return () => {
      player.clearLockScreenControls();
    };
  }, [player]);

  async function chooseTrack() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selected = result.assets[0];

      setLoading(true);

      player.pause();
      player.replace({ uri: selected.uri });

      setTrack({
        name: selected.name,
        uri: selected.uri,
      });
    } catch (error) {
      console.error('Erreur de sélection :', error);
      Alert.alert(
        'Impossible de sélectionner le fichier',
        'Vérifie que le fichier audio est accessible, puis réessaie.',
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePlayback() {
    if (!track) {
      Alert.alert(
        'Aucun morceau',
        'Sélectionne d’abord un fichier audio.',
      );
      return;
    }

    if (status.playing) {
      player.pause();
      return;
    }

    player.setActiveForLockScreen(true, {
      title: track.name,
      artist: 'LordWave',
      albumTitle: 'Bibliothèque locale',
    });

    player.play();
  }

  function seekBy(seconds: number) {
    if (!track || !Number.isFinite(status.duration)) {
      return;
    }

    const nextTime = Math.max(
      0,
      Math.min(status.currentTime + seconds, status.duration),
    );

    player.seekTo(nextTime);
  }

  const progress =
    status.duration > 0
      ? Math.min(status.currentTime / status.duration, 1)
      : 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.logo}>LordWave</Text>
        <Text style={styles.subtitle}>
          YOUR MUSIC. YOUR FLOW.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.artwork}>
          <Text style={styles.wave}>♫</Text>
        </View>

        <Text style={styles.trackTitle} numberOfLines={2}>
          {track?.name ?? 'Aucun morceau sélectionné'}
        </Text>

        <Text style={styles.artist}>
          {track ? 'Fichier local' : 'Choisis une musique sur ton téléphone'}
        </Text>

        <Pressable
          onPress={chooseTrack}
          style={styles.selectButton}
          accessibilityRole="button"
        >
          <Text style={styles.selectButtonText}>
            {loading ? 'Chargement…' : 'Choisir un fichier audio'}
          </Text>
        </Pressable>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.time}>
            {formatTime(status.currentTime)}
          </Text>
          <Text style={styles.time}>
            {formatTime(status.duration)}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={() => seekBy(-10)}
            style={styles.secondaryControl}
            accessibilityRole="button"
            accessibilityLabel="Reculer de 10 secondes"
          >
            <Text style={styles.controlText}>−10</Text>
          </Pressable>

          <Pressable
            onPress={togglePlayback}
            style={styles.playButton}
            accessibilityRole="button"
            accessibilityLabel={
              status.playing ? 'Mettre en pause' : 'Lire le morceau'
            }
          >
            <Text style={styles.playButtonText}>
              {status.playing ? 'Ⅱ' : '▶'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => seekBy(10)}
            style={styles.secondaryControl}
            accessibilityRole="button"
            accessibilityLabel="Avancer de 10 secondes"
          >
            <Text style={styles.controlText}>+10</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Lecture locale · Sans publicité
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D1020',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#9B91FF',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#171B30',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  artwork: {
    width: 180,
    height: 180,
    borderRadius: 24,
    backgroundColor: '#29265A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  wave: {
    color: '#B5A7FF',
    fontSize: 86,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  artist: {
    color: '#A6AAC1',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 26,
    textAlign: 'center',
  },
  selectButton: {
    width: '100%',
    backgroundColor: '#7865F5',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#343951',
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    backgroundColor: '#A99BFF',
    borderRadius: 5,
  },
  timeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  time: {
    color: '#A6AAC1',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginTop: 26,
  },
  secondaryControl: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#D8D5FF',
    fontSize: 18,
    fontWeight: '700',
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#A99BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#17152C',
    fontSize: 27,
    fontWeight: '800',
  },
  footer: {
    color: '#858AA5',
    fontSize: 11,
    marginTop: 28,
  },
});

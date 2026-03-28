import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from 'expo-router';

export default function ModalScreen() {
  const params = useLocalSearchParams();
  const summaryStr = typeof params.summary === 'string' ? params.summary : undefined;
  const summary = summaryStr ? JSON.parse(summaryStr) as { durationSeconds: number; startedAt: string; endedAt: string } : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Summary</Text>
      <View style={styles.separator} />
      {summary ? (
        <View>
          <Text>Started: {new Date(summary.startedAt).toLocaleString()}</Text>
          <Text>Ended: {new Date(summary.endedAt).toLocaleString()}</Text>
          <Text>Duration: {Math.floor(summary.durationSeconds/60)} min</Text>
        </View>
      ) : (
        <Text>No summary available.</Text>
      )}

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

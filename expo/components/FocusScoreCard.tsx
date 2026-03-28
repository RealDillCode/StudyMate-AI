import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CircularProgress } from '@/components/CircularProgress';
import { Colors } from '@/constants/colors';
import { FocusMetrics } from '@/types';
import { formatTime } from '@/utils/timeUtils';

type FocusScoreCardProps = {
  focusMetrics: FocusMetrics;
};

export function FocusScoreCard({ focusMetrics }: FocusScoreCardProps) {
  const { focusScore, productiveTime, distractedTime } = focusMetrics;
  
  const getFocusScoreColor = () => {
    if (focusScore >= 80) {
      return Colors.secondary;
    } else if (focusScore >= 60) {
      return Colors.blue;
    } else if (focusScore >= 40) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  };
  
  const getFocusScoreText = () => {
    if (focusScore >= 80) {
      return 'Excellent';
    } else if (focusScore >= 60) {
      return 'Good';
    } else if (focusScore >= 40) {
      return 'Fair';
    } else {
      return 'Needs Improvement';
    }
  };
  
  const focusScoreColor = getFocusScoreColor();
  const focusScoreText = getFocusScoreText();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus Score</Text>
        <Text style={[styles.scoreText, { color: focusScoreColor }]}>{focusScoreText}</Text>
      </View>
      
      <View style={styles.content}>
        <CircularProgress
          progress={focusScore}
          size={120}
          progressColor={focusScoreColor}
          showPercentage={true}
        />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: Colors.secondary }]} />
            <View>
              <Text style={styles.statLabel}>Productive</Text>
              <Text style={styles.statValue}>{formatTime(productiveTime, 'short')}</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: Colors.red }]} />
            <View>
              <Text style={styles.statLabel}>Distracted</Text>
              <Text style={styles.statValue}>{formatTime(distractedTime, 'short')}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsContainer: {
    flex: 1,
    marginLeft: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
});
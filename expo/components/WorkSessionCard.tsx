import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { WorkSession } from '@/types';
import { formatDate, formatTime } from '@/utils/timeUtils';

type WorkSessionCardProps = {
  session: WorkSession;
};

export function WorkSessionCard({ session }: WorkSessionCardProps) {
  const { startTime, endTime, duration, breaks } = session;
  
  // Calculate total break time
  const totalBreakTime = breaks.reduce((total, breakItem) => {
    if (!breakItem.duration) return total;
    return total + breakItem.duration;
  }, 0);
  
  // Calculate effective work time (total duration - break time)
  const effectiveWorkTime = duration ? duration - totalBreakTime : 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={Colors.gray[600]} />
          <Text style={styles.dateText}>{formatDate(startTime, 'date')}</Text>
        </View>
        
        {session.isActive ? (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        ) : null}
      </View>
      
      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Start</Text>
          <Text style={styles.timeValue}>{formatDate(startTime, 'time')}</Text>
        </View>
        
        <View style={styles.timeSeparator} />
        
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>End</Text>
          <Text style={styles.timeValue}>
            {endTime ? formatDate(endTime, 'time') : 'In Progress'}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(duration || 0, 'short')}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(effectiveWorkTime, 'short')}</Text>
          <Text style={styles.statLabel}>Work Time</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(totalBreakTime, 'short')}</Text>
          <Text style={styles.statLabel}>Break Time</Text>
        </View>
      </View>
      
      {breaks.length > 0 && (
        <View style={styles.breaksContainer}>
          <Text style={styles.breaksTitle}>Breaks ({breaks.length})</Text>
          {breaks.map((breakItem) => (
            <View key={breakItem.id} style={styles.breakItem}>
              <Text style={styles.breakType}>{breakItem.type}</Text>
              <Text style={styles.breakTime}>
                {formatTime(breakItem.duration || 0, 'short')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginLeft: 6,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeSeparator: {
    width: 20,
    height: 1,
    backgroundColor: Colors.gray[300],
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.gray[200],
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  breaksContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  breaksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  breakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakType: {
    fontSize: 14,
    color: Colors.gray[700],
    textTransform: 'capitalize',
  },
  breakTime: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
  },
});
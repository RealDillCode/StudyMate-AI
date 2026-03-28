import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Coffee, Utensils, User } from 'lucide-react-native';

import { ClockButton } from '@/components/ClockButton';
import { TimeDisplay } from '@/components/TimeDisplay';
import { Colors } from '@/constants/colors';
import { useWorkSession } from '@/hooks/useWorkSession';

type SharedTimerSectionProps = {
  showBreakOptions?: boolean;
  compact?: boolean;
};

export function SharedTimerSection({ 
  showBreakOptions = false, 
  compact = false 
}: SharedTimerSectionProps) {
  const { 
    currentSession, 
    currentBreak, 
    startWorkSession, 
    endWorkSession,
    startBreak,
    endBreak,
  } = useWorkSession();
  
  const handleClockButtonPress = () => {
    if (currentSession) {
      endWorkSession();
    } else {
      startWorkSession();
    }
  };
  
  const handleBreakPress = (type: 'coffee' | 'lunch' | 'personal') => {
    if (currentSession && !currentBreak) {
      startBreak(type);
    }
  };
  
  const handleEndBreak = () => {
    if (currentBreak) {
      endBreak();
    }
  };
  
  const getBreakTypeInfo = (type: string) => {
    switch (type) {
      case 'lunch':
        return { icon: Utensils, label: 'Lunch Break', color: Colors.accent };
      case 'coffee':
        return { icon: Coffee, label: 'Coffee Break', color: Colors.primary };
      case 'personal':
        return { icon: User, label: 'Personal Break', color: Colors.secondary };
      default:
        return { icon: Coffee, label: 'Break', color: Colors.primary };
    }
  };
  
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Timer Display */}
      {currentSession && (
        <View style={styles.timerSection}>
          <TimeDisplay 
            startTime={currentSession.startTime}
            isActive={true}
            size={compact ? "medium" : "large"}
            label={currentBreak ? "On Break" : "Working"}
          />
          
          {/* Break Timer */}
          {currentBreak && (
            <View style={styles.breakTimerContainer}>
              <View style={styles.breakTimerHeader}>
                <Text style={styles.breakTimerLabel}>
                  {getBreakTypeInfo(currentBreak.type).label}
                </Text>
              </View>
              <View style={styles.breakTimerContent}>
                <TimeDisplay 
                  startTime={currentBreak.startTime}
                  isActive={true}
                  size="small"
                  showLabel={false}
                />
                <TouchableOpacity 
                  style={styles.endBreakButton}
                  onPress={handleEndBreak}
                >
                  <Text style={styles.endBreakText}>End Break</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
      
      {/* Clock In/Out Button */}
      <View style={styles.clockButtonContainer}>
        <ClockButton 
          isClockIn={!currentSession}
          onPress={handleClockButtonPress}
        />
      </View>
      
      {/* Break Options */}
      {currentSession && !currentBreak && showBreakOptions && (
        <View style={styles.breakOptionsContainer}>
          <Text style={styles.breakOptionsTitle}>Take a Break</Text>
          <View style={styles.breakButtons}>
            <TouchableOpacity 
              style={[styles.breakButton, { backgroundColor: Colors.primary }]}
              onPress={() => handleBreakPress('coffee')}
            >
              <Coffee size={20} color={Colors.white} />
              <Text style={styles.breakButtonText}>Coffee</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.breakButton, { backgroundColor: Colors.accent }]}
              onPress={() => handleBreakPress('lunch')}
            >
              <Utensils size={20} color={Colors.white} />
              <Text style={styles.breakButtonText}>Lunch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.breakButton, { backgroundColor: Colors.secondary }]}
              onPress={() => handleBreakPress('personal')}
            >
              <User size={20} color={Colors.white} />
              <Text style={styles.breakButtonText}>Personal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Simple Break Button for Dashboard */}
      {currentSession && !currentBreak && !showBreakOptions && (
        <View style={styles.simpleBreakContainer}>
          <TouchableOpacity 
            style={styles.simpleBreakButton}
            onPress={() => handleBreakPress('coffee')}
          >
            <Text style={styles.simpleBreakText}>Take a Break</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  containerCompact: {
    padding: 16,
    borderRadius: 16,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  breakTimerContainer: {
    marginTop: 16,
    backgroundColor: `${Colors.accent}15`,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  breakTimerHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  breakTimerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
  breakTimerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  endBreakButton: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  endBreakText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  clockButtonContainer: {
    width: '100%',
    marginTop: 8,
  },
  breakOptionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  breakOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 12,
    textAlign: 'center',
  },
  breakButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  breakButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  breakButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  simpleBreakContainer: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  simpleBreakButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
  },
  simpleBreakText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
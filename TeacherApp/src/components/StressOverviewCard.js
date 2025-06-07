import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const StressOverviewCard = ({ classData }) => {
  const navigation = useNavigation();

  const getStressLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const getStressLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'alert-circle';
      case 'low':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'increasing':
        return 'trending-up';
      case 'decreasing':
        return 'trending-down';
      case 'stable':
        return 'remove';
      default:
        return 'help-circle';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'increasing':
        return '#ef4444';
      case 'decreasing':
        return '#10b981';
      case 'stable':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const totalStudents = classData.studentsWithHighStress + 
                       classData.studentsWithMediumStress + 
                       classData.studentsWithLowStress + 
                       classData.studentsWithNoData;

  const handlePress = () => {
    navigation.navigate('Classes', {
      screen: 'ClassDetail',
      params: { classId: classData.classId, className: classData.className }
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.className}>{classData.className}</Text>
          <Text style={styles.studentCount}>{totalStudents} students</Text>
        </View>
        <View style={[styles.stressIndicator, { backgroundColor: getStressLevelColor(classData.averageStressLevel) }]}>
          <Ionicons 
            name={getStressLevelIcon(classData.averageStressLevel)} 
            size={16} 
            color="#ffffff" 
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{classData.averageStressScore?.toFixed(1) || 'N/A'}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{classData.studentsWithHighStress}</Text>
          <Text style={styles.statLabel}>High Stress</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{classData.studentsWithMediumStress}</Text>
          <Text style={styles.statLabel}>Medium</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{classData.studentsWithLowStress}</Text>
          <Text style={styles.statLabel}>Low</Text>
        </View>
      </View>

      {classData.trend && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={getTrendIcon(classData.trend)} 
            size={14} 
            color={getTrendColor(classData.trend)} 
          />
          <Text style={[styles.trendText, { color: getTrendColor(classData.trend) }]}>
            {classData.trend}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.viewDetails}>Tap to view details</Text>
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  studentCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  stressIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  viewDetails: {
    fontSize: 14,
    color: '#64748b',
  },
});

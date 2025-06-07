import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const StudentStressCard = ({ student, onPress }) => {
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

  const stressColor = getStressLevelColor(student.stressLevel);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {student.studentName ? student.studentName.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.studentName || 'Unknown Student'}</Text>
          <Text style={styles.studentEmail}>{student.username}</Text>
        </View>
        <View style={[styles.stressIndicator, { backgroundColor: stressColor }]}>
          <Ionicons 
            name={getStressLevelIcon(student.stressLevel)} 
            size={16} 
            color="#ffffff" 
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {student.dailyAverageStressScore?.toFixed(1) || 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Daily Avg</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: stressColor }]}>
            {student.stressLevel || 'No Data'}
          </Text>
          <Text style={styles.statLabel}>Stress Level</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {student.totalAnalysesToday || 0}
          </Text>
          <Text style={styles.statLabel}>Analyses Today</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.viewDetails}>Tap for details</Text>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  studentEmail: {
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
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
    fontSize: 12,
    color: '#64748b',
  },
});

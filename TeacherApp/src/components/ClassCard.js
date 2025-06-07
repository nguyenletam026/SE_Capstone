import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ClassCard = ({ classData, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="school" size={24} color="#6366f1" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.className}>{classData.className}</Text>
          {classData.description && (
            <Text style={styles.description}>{classData.description}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>

      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>
            {classData.studentCount || 0} students
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>
            Created {new Date(classData.createdAt).toLocaleDateString()}
          </Text>
        </View>
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
});

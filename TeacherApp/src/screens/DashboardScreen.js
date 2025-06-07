import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { teacherAPI } from '../services/api';
import { StressOverviewCard } from '../components/StressOverviewCard';
import { StatsCard } from '../components/StatsCard';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classesOverview, setClassesOverview] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    highStressStudents: 0,
    mediumStressStudents: 0,
    lowStressStudents: 0,
  });
  const loadDashboardData = async () => {
    try {
      const overviewData = await teacherAPI.getAllClassesStressOverview();
      console.log('Overview data received:', overviewData);
      
      // Ensure overviewData is an array
      const classesArray = Array.isArray(overviewData) ? overviewData : [];
      setClassesOverview(classesArray);

      // Calculate stats
      const totalClasses = classesArray.length;
      let totalStudents = 0;
      let highStressStudents = 0;
      let mediumStressStudents = 0;
      let lowStressStudents = 0;

      classesArray.forEach(classData => {
        totalStudents += (classData.studentsWithHighStress || 0) + 
                        (classData.studentsWithMediumStress || 0) + 
                        (classData.studentsWithLowStress || 0) + 
                        (classData.studentsWithNoData || 0);
        highStressStudents += (classData.studentsWithHighStress || 0);
        mediumStressStudents += (classData.studentsWithMediumStress || 0);
        lowStressStudents += (classData.studentsWithLowStress || 0);
      });

      setStats({
        totalClasses,
        totalStudents,
        highStressStudents,
        mediumStressStudents,
        lowStressStudents,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
      // Set empty arrays on error
      setClassesOverview([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter class name');
      return;
    }

    setCreating(true);
    try {
      await teacherAPI.createClass({
        className: newClassName.trim(),
        description: newClassDescription.trim(),
      });
      
      Alert.alert('Success', 'Class created successfully');
      setShowCreateModal(false);
      setNewClassName('');
      setNewClassDescription('');
      
      // Refresh dashboard data to show new class
      loadDashboardData();
    } catch (error) {
      console.error('Error creating class:', error);
      Alert.alert('Error', 'Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateNewClass = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewClassName('');
    setNewClassDescription('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreetingTime()}</Text>
          <Text style={styles.userName}>{user?.fullName || user?.username}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          icon="school"
          color="#6366f1"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="people"
          color="#10b981"
        />
      </View>

      <View style={styles.statsContainer}>
        <StatsCard
          title="High Stress"
          value={stats.highStressStudents}
          icon="warning"
          color="#ef4444"
        />
        <StatsCard
          title="Medium Stress"
          value={stats.mediumStressStudents}
          icon="alert-circle"
          color="#f59e0b"
        />
      </View>      {/* Create Class Button */}
      <View style={styles.createClassContainer}>
        <TouchableOpacity
          style={styles.createClassButton}
          onPress={handleCreateNewClass}
        >
          <Ionicons name="add-circle" size={24} color="#ffffff" />
          <Text style={styles.createClassButtonText}>Create New Class</Text>
        </TouchableOpacity>
      </View>

      {/* Classes Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Classes Overview</Text>
        <Text style={styles.sectionSubtitle}>Stress levels by class</Text>
      </View>

      <View style={styles.classesContainer}>
        {classesOverview.map((classData, index) => (
          <StressOverviewCard key={index} classData={classData} />
        ))}
      </View>      {classesOverview.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No classes found</Text>
          <Text style={styles.emptySubtext}>Start by creating your first class</Text>          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={handleCreateNewClass}
          >
            <Ionicons name="add" size={20} color="#6366f1" />
            <Text style={styles.emptyCreateButtonText}>Create Class</Text>
          </TouchableOpacity>        </View>
      )}

      {/* Create Class Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Class</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newClassName}
                  onChangeText={setNewClassName}
                  placeholder="Enter class name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newClassDescription}
                  onChangeText={setNewClassDescription}
                  placeholder="Enter class description (optional)"
                  placeholderTextColor="#9ca3af"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, creating && styles.createButtonDisabled]}
                onPress={handleCreateClass}
                disabled={creating}
              >
                <Text style={styles.createButtonText}>
                  {creating ? 'Creating...' : 'Create Class'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#6366f1',
  },
  greeting: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  date: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  createClassContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  createClassButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },  createClassButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCreateButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  classesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

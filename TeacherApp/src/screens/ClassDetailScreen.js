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
import { useNavigation, useRoute } from '@react-navigation/native';
import { teacherAPI } from '../services/api';
import { StressChart } from '../components/charts/StressChart';
import { StudentStressCard } from '../components/StudentStressCard';

export const ClassDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, className } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classOverview, setClassOverview] = useState(null);
  const [studentsStress, setStudentsStress] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentUsername, setStudentUsername] = useState('');
  const [adding, setAdding] = useState(false);
  const loadClassData = async () => {
    try {
      const [overviewData, stressData] = await Promise.all([
        teacherAPI.getClassStressOverview(classId),
        teacherAPI.getClassStressData(classId),
      ]);      console.log('Class overview data:', overviewData);
      console.log('Class stress data:', stressData);
      console.log('First student object:', stressData.length > 0 ? stressData[0] : 'No students');

      setClassOverview(overviewData);
      
      // Ensure stressData is an array
      const stressArray = Array.isArray(stressData) ? stressData : [];
      setStudentsStress(stressArray);
    } catch (error) {
      console.error('Error loading class data:', error);
      Alert.alert('Error', 'Failed to load class data');
      // Set defaults on error
      setClassOverview(null);
      setStudentsStress([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClassData();
  }, [classId]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClassData();
  }, []);

  const handleAddStudent = async () => {
    if (!studentUsername.trim()) {
      Alert.alert('Error', 'Please enter a student username');
      return;
    }

    setAdding(true);
    try {
      await teacherAPI.addStudentToClass(classId, studentUsername.trim());
      
      Alert.alert('Success', 'Student added to class successfully');
      setShowAddStudentModal(false);
      setStudentUsername('');
      loadClassData(); // Refresh the class data
    } catch (error) {
      console.error('Error adding student to class:', error);
      Alert.alert('Error', 'Failed to add student to class. Please check the username.');
    } finally {
      setAdding(false);
    }
  };

  const resetAddStudentModal = () => {
    setShowAddStudentModal(false);
    setStudentUsername('');
  };const handleStudentPress = (student) => {
    console.log('Student object:', student);
    navigation.navigate('StudentDetail', {
      studentId: student.studentId,
      studentName: student.studentName,
      classId: classId, // Pass classId to help get studentStressInfo
    });
  };

  const getStressDistributionData = () => {
    if (!classOverview) return [];

    return [
      {
        name: 'High Stress',
        count: classOverview.studentsWithHighStress,
        color: '#ef4444',
        legendFontColor: '#1e293b',
        legendFontSize: 12,
      },
      {
        name: 'Medium Stress',
        count: classOverview.studentsWithMediumStress,
        color: '#f59e0b',
        legendFontColor: '#1e293b',
        legendFontSize: 12,
      },
      {
        name: 'Low Stress',
        count: classOverview.studentsWithLowStress,
        color: '#10b981',
        legendFontColor: '#1e293b',
        legendFontSize: 12,
      },
      {
        name: 'No Data',
        count: classOverview.studentsWithNoData,
        color: '#64748b',
        legendFontColor: '#1e293b',
        legendFontSize: 12,
      },
    ];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading class details...</Text>
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
        <Text style={styles.className}>{className}</Text>
        {classOverview && (
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {classOverview.averageStressScore?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getStressLevelColor(classOverview.averageStressLevel) }]}>
                {classOverview.averageStressLevel || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Stress Level</Text>
            </View>
          </View>
        )}
      </View>

      {/* Stress Distribution Chart */}
      {classOverview && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Stress Distribution</Text>
          <StressChart data={getStressDistributionData()} />
        </View>
      )}

      {/* Alert Cards */}
      {classOverview && classOverview.studentsWithHighStress > 0 && (
        <View style={styles.alertContainer}>
          <View style={styles.alertCard}>
            <Ionicons name="warning" size={24} color="#ef4444" />
            <Text style={styles.alertText}>
              {classOverview.studentsWithHighStress} student(s) have high stress levels
            </Text>
          </View>
        </View>
      )}      {/* Students List */}
      <View style={styles.studentsSection}>
        <View style={styles.studentsHeader}>
          <Text style={styles.sectionTitle}>Students ({studentsStress.length})</Text>
          <TouchableOpacity
            style={styles.addStudentButton}
            onPress={() => setShowAddStudentModal(true)}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.addStudentButtonText}>Add Student</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.studentsList}>
          {studentsStress.map((student, index) => (
            <StudentStressCard
              key={student.studentId || index}
              student={student}
              onPress={() => handleStudentPress(student)}
            />
          ))}
        </View>
      </View>      {studentsStress.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No students found</Text>
          <Text style={styles.emptySubtext}>
            This class doesn't have any students yet
          </Text>
        </View>
      )}

      {/* Add Student Modal */}
      <Modal
        visible={showAddStudentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetAddStudentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Student to Class</Text>
              <TouchableOpacity onPress={resetAddStudentModal}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Student Username *</Text>
              <TextInput
                style={styles.textInput}
                value={studentUsername}
                onChangeText={setStudentUsername}
                placeholder="Enter student username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetAddStudentModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, adding && styles.buttonDisabled]}
                onPress={handleAddStudent}
                disabled={adding}
              >
                <Text style={styles.addButtonText}>
                  {adding ? 'Adding...' : 'Add Student'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

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
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  alertContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  alertCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    marginLeft: 12,
    fontWeight: '500',
  },  studentsSection: {
    paddingHorizontal: 20,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addStudentButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addStudentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  studentsList: {
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
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  inputContainer: {
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
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

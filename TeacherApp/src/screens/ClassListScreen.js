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
import { useNavigation } from '@react-navigation/native';
import { teacherAPI } from '../services/api';
import { ClassCard } from '../components/ClassCard';

export const ClassListScreen = () => {
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const loadClasses = async () => {
    try {
      const classesData = await teacherAPI.getClasses();
      console.log('Classes data received:', classesData);
      
      // Ensure classesData is an array
      const classesArray = Array.isArray(classesData) ? classesData : [];
      setClasses(classesArray);
    } catch (error) {
      console.error('Error loading classes:', error);
      Alert.alert('Error', 'Failed to load classes');
      setClasses([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadClasses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClasses();
  }, []);

  const handleClassPress = (classItem) => {
    navigation.navigate('ClassDetail', {
      classId: classItem.id,
      className: classItem.className,
    });
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
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
      loadClasses(); // Refresh the class list
    } catch (error) {
      console.error('Error creating class:', error);
      Alert.alert('Error', 'Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setNewClassName('');
    setNewClassDescription('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading classes...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>My Classes</Text>
              <Text style={styles.subtitle}>Manage your classes and monitor student stress</Text>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Class</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.classesContainer}>
          {classes.map((classItem, index) => (
            <ClassCard
              key={classItem.id || index}
              classData={classItem}
              onPress={() => handleClassPress(classItem)}
            />
          ))}
        </View>

        {classes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No classes found</Text>            <Text style={styles.emptySubtext}>
              You don't have any classes assigned yet
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Class Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetCreateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Class</Text>
              <TouchableOpacity onPress={resetCreateModal}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Class Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newClassName}
                onChangeText={setNewClassName}
                placeholder="Enter class name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newClassDescription}
                onChangeText={setNewClassDescription}
                placeholder="Enter class description (optional)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetCreateModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createClassButton, creating && styles.buttonDisabled]}
                onPress={handleCreateClass}
                disabled={creating}
              >
                <Text style={styles.createClassButtonText}>
                  {creating ? 'Creating...' : 'Create Class'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  classesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  createClassButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createClassButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

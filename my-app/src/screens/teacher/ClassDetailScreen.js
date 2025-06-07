import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getClassDetails, addStudentToClass } from '../../services/apiService';

const ClassDetailScreen = ({ route, navigation }) => {
  const { classId, className } = route.params || {};  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentUsername, setStudentUsername] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, []);

  useEffect(() => {
    if (className) {
      navigation.setOptions({ title: className });
    }
  }, [className, navigation]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await getClassDetails(classId);
      
      if (response && response.result) {
        console.log('Class details fetched:', response.result);
        setClassData(response.result);
        if (response.result.students) {
          setStudents(response.result.students);
        }
        console.log(response.result)
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchClassDetails();
  };

  const showAddStudentModal = () => {
    setModalVisible(true);
    setStudentUsername('');
  };

  const hideAddStudentModal = () => {
    setModalVisible(false);
    setStudentUsername('');
    setAddingStudent(false);
  };

  const handleAddStudent = async () => {
    if (!studentUsername.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập sinh viên');
      return;
    }

    try {
      setAddingStudent(true);
      const response = await addStudentToClass(classId, studentUsername.trim());
      
      if (response && response.result) {
        Alert.alert('Thành công', 'Thêm sinh viên vào lớp thành công');
        hideAddStudentModal();
        fetchClassDetails(); // Refresh class data
      }
    } catch (error) {
      console.error('Error adding student:', error);
      Alert.alert('Lỗi', 'Không thể thêm sinh viên. Vui lòng kiểm tra lại tên đăng nhập.');
    } finally {
      setAddingStudent(false);
    }
  };

  const navigateToStudentDetail = (studentId, studentName) => {
    navigation.navigate('StudentDetail', { 
      studentId, 
      studentName,
      classId,
      className
    });
  };
  const renderStudentItem = ({ item }) => {
    // Tạo tên hiển thị an toàn, sử dụng name nếu có, hoặc rút trích từ firstName và lastName
    const displayName = item.name || 
                       (item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : 
                        (item.username || 'Sinh viên'));
    
    return (
      <TouchableOpacity 
        style={styles.studentItem}
        onPress={() => navigateToStudentDetail(item.id, displayName)}
      >        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{displayName}</Text>
          <Text style={styles.studentId}>Email: {item.username || 'N/A'}</Text>
        </View>

        <View style={[styles.stressLevelBadge, 
          { backgroundColor: getStressLevelColor(item.stressLevel || 'UNKNOWN') }]}>
          <Text style={styles.stressLevelText}>
            {getStressLevelText(item.stressLevel || 'UNKNOWN')}
          </Text>
        </View>

        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const getStressLevelColor = (level) => {
    switch(level) {
      case 'HIGH': return '#ffccc7';
      case 'MEDIUM': return '#ffe7ba';
      case 'LOW': return '#d9f7be';
      default: return '#f0f0f0';
    }
  };

  const getStressLevelText = (level) => {
    switch(level) {
      case 'HIGH': return 'Cao';
      case 'MEDIUM': return 'TB';
      case 'LOW': return 'Thấp';
      default: return 'N/A';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.className}>{classData?.name}</Text>
        <Text style={styles.classInfo}>
          {students.length} sinh viên • Mã lớp: {classData?.code || 'N/A'}
        </Text>
      </View>

      {classData?.description ? (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Mô tả lớp học:</Text>
          <Text style={styles.description}>{classData.description}</Text>
        </View>
      ) : null}      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Danh sách sinh viên</Text>
        <TouchableOpacity style={styles.addButton} onPress={showAddStudentModal}>
          <MaterialIcons name="person-add" size={20} color="#1890ff" />
          <Text style={styles.addButtonText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={60} color="#d9d9d9" />
            <Text style={styles.emptyText}>Chưa có sinh viên nào trong lớp</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={showAddStudentModal}>
              <Text style={styles.emptyButtonText}>Thêm sinh viên</Text>
            </TouchableOpacity>
          </View>        }
      />

      {/* Add Student Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideAddStudentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm sinh viên vào lớp</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tên đăng nhập sinh viên:</Text>
              <TextInput
                style={styles.textInput}
                value={studentUsername}
                onChangeText={setStudentUsername}
                placeholder="Nhập tên đăng nhập..."
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={hideAddStudentModal}
                disabled={addingStudent}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleAddStudent}
                disabled={addingStudent}
              >
                {addingStudent ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Thêm</Text>
                )}
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
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  className: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  classInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    color: '#1890ff',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  studentId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stressLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  stressLevelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginVertical: 16,
  },
  emptyButton: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#1890ff',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ClassDetailScreen;
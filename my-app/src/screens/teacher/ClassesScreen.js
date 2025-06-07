import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { 
  FAB, 
  Card, 
  ActivityIndicator, 
  Button 
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTeacherClasses, createClass, updateClass, deleteClass } from '../../services/apiService';

const ClassesScreen = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [editingClassId, setEditingClassId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getTeacherClasses();
      setClasses(response.result || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const handleCreateClass = () => {
    setEditingClassId(null);
    setClassName('');
    setDescription('');
    setModalVisible(true);
  };

  const handleEditClass = (classItem) => {
    setEditingClassId(classItem.id);
    setClassName(classItem.name);
    setDescription(classItem.description || '');
    setModalVisible(true);
  };

  const handleDeleteClass = (classId, className) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa lớp "${className}"? Thao tác này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClass(classId);
              Alert.alert('Thành công', 'Xóa lớp học thành công');
              fetchClasses();
            } catch (error) {
              console.error('Error deleting class:', error);
              Alert.alert('Lỗi', 'Không thể xóa lớp học. Vui lòng thử lại sau.');
            }
          },
        },
      ]
    );
  };

  const handleSaveClass = async () => {
    if (!className.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên lớp học');
      return;
    }

    try {
      if (editingClassId) {
        await updateClass(editingClassId, className, description);
      } else {
        await createClass(className, description);
      }
      
      setModalVisible(false);
      Alert.alert('Thành công', editingClassId ? 'Cập nhật lớp học thành công' : 'Tạo lớp học mới thành công');
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      Alert.alert('Lỗi', 'Không thể lưu lớp học. Vui lòng thử lại sau.');
    }
  };

  const navigateToClassDetail = (classItem) => {
    navigation.navigate('ClassDetail', { 
      classId: classItem.id, 
      className: classItem.name 
    });
  };

  const renderClassItem = ({ item }) => (
    <Card style={styles.classCard}>
      <Card.Content>
        <View style={styles.classCardHeader}>
          <Text style={styles.className}>{item.name}</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => handleEditClass(item)}
            >
              <MaterialIcons name="edit" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => handleDeleteClass(item.id, item.name)}
            >
              <MaterialIcons name="delete" size={18} color="#ff4d4f" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.classDescription} numberOfLines={2}>
          {item.description || 'Không có mô tả'}
        </Text>
        
        <View style={styles.classInfoContainer}>
          <View style={styles.classInfoItem}>
            <MaterialIcons name="people" size={16} color="#1890ff" />
            <Text style={styles.classInfoText}>
              {item.students?.length || 0} sinh viên
            </Text>
          </View>
          
          <View style={styles.classInfoItem}>
            <MaterialIcons name="date-range" size={16} color="#1890ff" />
            <Text style={styles.classInfoText}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </Card.Content>
      
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigateToClassDetail(item)}
          style={styles.viewButton}
          labelStyle={styles.viewButtonLabel}
        >
          Chi tiết
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="class" size={60} color="#ccc" />
      <Text style={styles.emptyText}>
        Chưa có lớp học nào. Tạo lớp mới để bắt đầu.
      </Text>
      <Button 
        mode="contained" 
        onPress={handleCreateClass}
        style={styles.createButton}
      >
        Tạo lớp học
      </Button>
    </View>
  );

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
        <Text style={styles.title}>Quản lý lớp học</Text>
      </View>

      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateClass}
        color="#fff"
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingClassId ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tên lớp học *</Text>
              <TextInput
                style={styles.input}
                value={className}
                onChangeText={setClassName}
                placeholder="Nhập tên lớp học"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập mô tả lớp học"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                Hủy
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSaveClass}
                style={styles.saveButton}
              >
                {editingClassId ? 'Cập nhật' : 'Tạo lớp'}
              </Button>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  classCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 10,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  classDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  classInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: '#1890ff',
    marginLeft: 'auto',
  },
  viewButtonLabel: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#1890ff',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1890ff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#1890ff',
  },
});

export default ClassesScreen;
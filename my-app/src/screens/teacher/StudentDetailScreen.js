import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getStudentDetails, getStudentStressData } from '../../services/apiService';

const StudentDetailScreen = ({ route, navigation }) => {
  const { studentId, studentName, classId, className } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [student, setStudent] = useState(null);
  const [stressData, setStressData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (studentName) {
      navigation.setOptions({ title: studentName });
    }
  }, [studentName, navigation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch student details
      const studentResponse = await getStudentDetails(studentId);
      if (studentResponse && studentResponse.result) {
        setStudent(studentResponse.result);
      }
      
      // Fetch stress data
      const stressResponse = await getStudentStressData(studentId);
      if (stressResponse && stressResponse.result) {
        setStressData(stressResponse.result);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sinh viên');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStressLevelColor = (level) => {
    switch(level) {
      case 'HIGH': return '#ff4d4f';
      case 'MEDIUM': return '#faad14'; 
      case 'LOW': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getStressLevelText = (level) => {
    switch(level) {
      case 'HIGH': return 'Cao';
      case 'MEDIUM': return 'Trung bình';
      case 'LOW': return 'Thấp';
      default: return 'Không có dữ liệu';
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{student?.firstName} {student?.lastName}</Text>
          <Text style={styles.studentId}>MSSV: {student?.studentId || 'N/A'}</Text>
        </View>
        
        {stressData?.currentLevel ? (
          <View style={[styles.stressLevelBadge, 
            { backgroundColor: getStressLevelColor(stressData.currentLevel) }]}>
            <Text style={styles.stressLevelText}>
              {getStressLevelText(stressData.currentLevel)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
        
        <View style={styles.infoItem}>
          <MaterialIcons name="email" size={20} color="#1890ff" />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{student?.email || student?.username || 'N/A'}</Text>
        </View>
        
        {student?.phone && (
          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={20} color="#1890ff" />
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{student.phone}</Text>
          </View>
        )}
        
        <View style={styles.infoItem}>
          <MaterialIcons name="school" size={20} color="#1890ff" />
          <Text style={styles.infoLabel}>Lớp:</Text>
          <Text style={styles.infoValue}>{className || 'N/A'}</Text>
        </View>
      </View>
      
      {stressData ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phân tích căng thẳng</Text>
          
          <View style={styles.stressSummary}>
            <View style={styles.stressLevelIndicator}>
              <View 
                style={[
                  styles.stressLevelBar, 
                  { 
                    backgroundColor: getStressLevelColor(stressData.currentLevel),
                    width: `${stressData.stressScore ? Math.min(stressData.stressScore, 100) : 0}%`
                  }
                ]} 
              />
            </View>
            <Text style={styles.stressScore}>
              Điểm căng thẳng: {stressData.stressScore || 0}/100
            </Text>
          </View>

          {stressData.trend ? (
            <View style={styles.trendContainer}>
              <MaterialIcons 
                name={stressData.trend === 'increasing' ? 'trending-up' : 
                      stressData.trend === 'decreasing' ? 'trending-down' : 'trending-flat'} 
                size={20} 
                color={stressData.trend === 'increasing' ? '#ff4d4f' :
                       stressData.trend === 'decreasing' ? '#52c41a' : '#1890ff'} 
              />
              <Text style={styles.trendText}>
                {stressData.trend === 'increasing' ? 'Xu hướng tăng' :
                 stressData.trend === 'decreasing' ? 'Xu hướng giảm' : 'Ổn định'}
              </Text>
            </View>
          ) : null}
          
          <View style={styles.factorsContainer}>
            <Text style={styles.factorsTitle}>Các yếu tố ảnh hưởng:</Text>
            {stressData.factors && stressData.factors.length > 0 ? (
              stressData.factors.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <View style={styles.factorDot} />
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Chưa có dữ liệu phân tích</Text>
            )}
          </View>

          <TouchableOpacity style={styles.viewReportButton}>
            <Text style={styles.viewReportButtonText}>Xem báo cáo chi tiết</Text>
            <MaterialIcons name="chevron-right" size={20} color="#1890ff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phân tích căng thẳng</Text>
          <View style={styles.noDataContainer}>
            <MaterialIcons name="show-chart" size={50} color="#d9d9d9" />
            <Text style={styles.noDataText}>Chưa có dữ liệu phân tích</Text>
          </View>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="message" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Nhắn tin</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.removeButton]}>
          <MaterialIcons name="person-remove" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Xóa khỏi lớp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  studentId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  stressLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stressLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  stressSummary: {
    marginBottom: 16,
  },
  stressLevelIndicator: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  stressLevelBar: {
    height: '100%',
    borderRadius: 4,
  },
  stressScore: {
    fontSize: 14,
    color: '#666',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  factorsContainer: {
    marginBottom: 16,
  },
  factorsTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  factorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1890ff',
    marginRight: 8,
  },
  factorText: {
    fontSize: 14,
    color: '#666',
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewReportButtonText: {
    fontSize: 15,
    color: '#1890ff',
    marginRight: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1890ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  removeButton: {
    backgroundColor: '#ff4d4f',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default StudentDetailScreen;
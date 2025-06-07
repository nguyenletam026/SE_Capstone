import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTeacherStats } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    stressedStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getTeacherStats();
      setStats(response.result || {
        totalClasses: 0,
        totalStudents: 0,
        stressedStudents: 0,
      });
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      // Set default values on error
      setStats({
        totalClasses: 0,
        totalStudents: 0,
        stressedStudents: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const navigateToClasses = () => {
    navigation.navigate('Classes');
  };

  const navigateToStressAnalysis = () => {
    navigation.navigate('StressAnalysis');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Chào mừng, {user?.firstName || 'Giáo viên'}!
        </Text>
        <Text style={styles.subTitle}>Tổng quan lớp học</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <View style={styles.cardContent}>
            <MaterialIcons name="class" size={24} color="#1890ff" />
            <Text style={styles.statTitle}>Tổng số lớp học</Text>
            <Text style={styles.statValue}>{stats.totalClasses}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToClasses}
            >
              <Text style={styles.actionButtonText}>Quản lý lớp học</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <View style={styles.cardContent}>
            <MaterialIcons name="people" size={24} color="#52c41a" />
            <Text style={styles.statTitle}>Tổng số sinh viên</Text>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#52c41a' }]}
              onPress={navigateToClasses}
            >
              <Text style={styles.actionButtonText}>Xem danh sách</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <View style={styles.cardContent}>
            <MaterialIcons name="warning" size={24} color="#ff4d4f" />
            <Text style={styles.statTitle}>Sinh viên căng thẳng cao</Text>
            <Text style={styles.statValue}>{stats.stressedStudents}</Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ff4d4f' }]}
              onPress={navigateToStressAnalysis}
            >
              <Text style={styles.actionButtonText}>Xem phân tích</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <Card style={styles.guideCard}>
        <Card.Title
          title="Hướng dẫn nhanh"
          left={(props) => (
            <MaterialIcons name="help-outline" size={24} color="#1890ff" />
          )}
        />
        <Card.Content>
          <Text style={styles.guideText}>
            <Text style={styles.boldText}>Chào mừng đến với hệ thống quản lý sinh viên!</Text> Dưới đây là các chức năng chính:
          </Text>
          <View style={styles.guideList}>
            <View style={styles.guideItem}>
              <MaterialIcons name="check-circle" size={16} color="#52c41a" />
              <Text style={styles.guideItemText}>
                <Text style={styles.boldText}>Quản lý lớp học:</Text> Tạo lớp mới, thêm sinh viên vào lớp và quản lý danh sách.
              </Text>
            </View>
            <View style={styles.guideItem}>
              <MaterialIcons name="check-circle" size={16} color="#52c41a" />
              <Text style={styles.guideItemText}>
                <Text style={styles.boldText}>Phân tích căng thẳng:</Text> Xem mức độ căng thẳng của sinh viên và lịch sử.
              </Text>
            </View>
            <View style={styles.guideItem}>
              <MaterialIcons name="check-circle" size={16} color="#52c41a" />
              <Text style={styles.guideItemText}>
                <Text style={styles.boldText}>Theo dõi tiến độ:</Text> Xem các câu trả lời và xu hướng căng thẳng theo thời gian.
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 10,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#1890ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  guideCard: {
    marginBottom: 20,
    elevation: 2,
    borderRadius: 10,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  guideList: {
    marginTop: 12,
  },
  guideItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  guideItemText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
});

export default HomeScreen;
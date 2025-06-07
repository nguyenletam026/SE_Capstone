import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, 
  TouchableOpacity, FlatList, RefreshControl 
} from 'react-native';
import { Card, Divider, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllStudentsStressData } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';

const StressAnalysisScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    highStress: 0,
    mediumStress: 0,
    lowStress: 0,
    noData: 0,
    trend: 'stable'
  });
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAllStudentsStressData();
      if (response && response.result) {
        const studentsData = response.result.students || [];
        
        // Calculate statistics
        const highStress = studentsData.filter(s => s.stressLevel === 'HIGH').length;
        const mediumStress = studentsData.filter(s => s.stressLevel === 'MEDIUM').length;
        const lowStress = studentsData.filter(s => s.stressLevel === 'LOW').length;
        const noData = studentsData.filter(s => s.stressLevel === 'NO_DATA' || !s.stressLevel).length;
        
        setStats({
          total: studentsData.length,
          highStress,
          mediumStress,
          lowStress,
          noData,
          trend: response.result.trend || 'stable'
        });
        
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching stress analysis data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const navigateToStudentDetail = (studentId) => {
    navigation.navigate('StudentDetail', { studentId });
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

  const getTrendText = (trend) => {
    switch(trend) {
      case 'increasing': return 'Tăng';
      case 'decreasing': return 'Giảm';
      case 'stable': return 'Ổn định';
      default: return 'Chưa xác định';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'increasing':
        return <MaterialIcons name="trending-up" size={18} color="#ff4d4f" />;
      case 'decreasing':
        return <MaterialIcons name="trending-down" size={18} color="#52c41a" />;
      case 'stable':
        return <MaterialIcons name="trending-flat" size={18} color="#1890ff" />;
      default:
        return <MaterialIcons name="help-outline" size={18} color="#d9d9d9" />;
    }
  };

  const renderStressLevelChip = (level) => {
    return (
      <Chip
        style={{
          backgroundColor: `${getStressLevelColor(level)}20`, // 20% opacity
          borderColor: getStressLevelColor(level),
          borderWidth: 1,
        }}
        textStyle={{ color: getStressLevelColor(level) }}
      >
        {getStressLevelText(level)}
      </Chip>
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.studentCard} onPress={() => navigateToStudentDetail(item.studentId)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.className}>{item.className}</Text>
          </View>
          {renderStressLevelChip(item.stressLevel)}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={16} color="#8c8c8c" />
            <Text style={styles.infoText}>
              {item.lastUpdated 
                ? new Date(item.lastUpdated).toLocaleDateString('vi-VN')
                : 'Chưa có dữ liệu'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigateToStudentDetail(item.studentId)}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
            <MaterialIcons name="chevron-right" size={16} color="#1890ff" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Phân tích căng thẳng sinh viên</Text>
          <Text style={styles.subtitle}>Tổng quan về mức độ căng thẳng của sinh viên</Text>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.statsLabel}>Tổng số sinh viên</Text>
              <Text style={styles.statsValue}>{stats.total}</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statsCard, {borderLeftColor: '#ff4d4f'}]}>
            <Card.Content>
              <Text style={styles.statsLabel}>Mức độ cao</Text>
              <View style={styles.statsRow}>
                <Text style={[styles.statsValue, {color: '#ff4d4f'}]}>{stats.highStress}</Text>
                <Text style={styles.statsTotal}>/{stats.total}</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statsCard, {borderLeftColor: '#faad14'}]}>
            <Card.Content>
              <Text style={styles.statsLabel}>Mức độ trung bình</Text>
              <View style={styles.statsRow}>
                <Text style={[styles.statsValue, {color: '#faad14'}]}>{stats.mediumStress}</Text>
                <Text style={styles.statsTotal}>/{stats.total}</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statsCard, {borderLeftColor: '#52c41a'}]}>
            <Card.Content>
              <Text style={styles.statsLabel}>Mức độ thấp</Text>
              <View style={styles.statsRow}>
                <Text style={[styles.statsValue, {color: '#52c41a'}]}>{stats.lowStress}</Text>
                <Text style={styles.statsTotal}>/{stats.total}</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.statsLabel}>Xu hướng</Text>
              <View style={styles.trendContainer}>
                {getTrendIcon(stats.trend)}
                <Text style={styles.trendText}>{getTrendText(stats.trend)}</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {stats.highStress > 0 && (
          <View style={styles.warningContainer}>
            <MaterialIcons name="warning-amber" size={22} color="#faad14" />
            <Text style={styles.warningText}>
              Có {stats.highStress} sinh viên có mức độ căng thẳng cao cần chú ý
            </Text>
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Danh sách sinh viên</Text>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={students}
            renderItem={renderItem}
            keyExtractor={(item) => item.studentId.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1890ff',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  statsTotal: {
    fontSize: 16,
    color: '#999',
    marginLeft: 4,
    marginBottom: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 6,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#ffe58f',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#d48806',
    marginLeft: 8,
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: 8,
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  studentCard: {
    marginBottom: 8,
    marginHorizontal: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  className: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#8c8c8c',
    marginLeft: 4,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 14,
    color: '#1890ff',
    marginRight: 2,
  },
});

export default StressAnalysisScreen;
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { teacherAPI } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export const StudentDetailScreen = () => {
  const route = useRoute();
  const { studentId, studentName, classId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);  const [studentInfo, setStudentInfo] = useState(null);
  const [studentStressInfo, setStudentStressInfo] = useState(null);
  const [stressData, setStressData] = useState([]);
  const [stressResponse, setStressResponse] = useState(null);
  const [answers, setAnswers] = useState([]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };const loadStudentData = async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const fromDate = sevenDaysAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];

      console.log('Loading data for student:', studentId);
      console.log('Date range:', fromDate, 'to', toDate);      // Call APIs individually to identify which one fails
      let infoData = null;
      let studentStressData = null;
      let stressResponse = null;
      let answersData = [];

      try {
        console.log('Calling getStudentInfo...');
        infoData = await teacherAPI.getStudentInfo(studentId);
        console.log('Student info success:', infoData);
      } catch (error) {
        console.error('Error loading student info:', error.response?.status, error.response?.data);
        console.error('Student info API error:', error);
      }

      try {
        console.log('Calling getStudentStressInfo...');
        studentStressData = await teacherAPI.getStudentStressInfo(studentId, classId);
        console.log('Student stress info success:', studentStressData);
      } catch (error) {
        console.error('Error loading student stress info:', error.response?.status, error.response?.data);
        console.error('Student stress info API error:', error);
      }

      try {
        console.log('Calling getStudentStress...');
        stressResponse = await teacherAPI.getStudentStress(studentId);
        console.log('Student stress success:', stressResponse);
      } catch (error) {
        console.error('Error loading student stress:', error.response?.status, error.response?.data);
        console.error('Student stress API error:', error);
      }

      try {
        console.log('Calling getStudentAnswers...');
        answersData = await teacherAPI.getStudentAnswers(studentId, fromDate, toDate);
        console.log('Student answers success:', answersData);
      } catch (error) {
        console.error('Error loading student answers:', error.response?.status, error.response?.data);
        console.error('Student answers API error:', error);
      }      

      setStudentInfo(infoData);
      setStudentStressInfo(studentStressData);
      
      // Store the complete stress response for getCurrentStressInfo
      setStressResponse(stressResponse);
      
      // Handle stress data - it might be an object with history property
      let stressArray = [];
      if (stressResponse && typeof stressResponse === 'object') {
        if (Array.isArray(stressResponse)) {
          stressArray = stressResponse;
        } else if (stressResponse.history && Array.isArray(stressResponse.history)) {
          stressArray = stressResponse.history;
        }
      }
      
      // Ensure arrays
      const answersArray = Array.isArray(answersData) ? answersData : [];
      
      setStressData(stressArray);
      setAnswers(answersArray);
    } catch (error) {
      console.error('Error loading student data:', error);
      Alert.alert('Error', 'Failed to load student data: ' + (error.message || 'Unknown error'));
      // Set defaults on error
      setStudentInfo(null);
      setStressData([]);
      setAnswers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudentData();
  }, []);

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
  const getChartData = () => {
    // First try to use stress response history
    let dataToUse = [];
    
    if (stressResponse && stressResponse.history && Array.isArray(stressResponse.history)) {
      dataToUse = stressResponse.history;
    } else if (stressData && Array.isArray(stressData)) {
      dataToUse = stressData;
    }
    
    if (!dataToUse || dataToUse.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    // Get last 7 days of data
    const last7Days = dataToUse.slice(-7);
    const labels = last7Days.map(item => {
      const date = new Date(item.date || item.analysisDate);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // Convert stress levels to numeric values for chart
    const data = last7Days.map(item => {
      // If we have numeric score, use it
      if (item.stressScore !== undefined) {
        return item.stressScore;
      }
      
      // Convert level to numeric value
      const level = item.level || item.stressLevel;
      switch (level?.toLowerCase()) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
      }
    });

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    yAxisSuffix: '',
    formatYLabel: (value) => {
      // Convert numeric values back to stress level labels
      switch (Math.round(value)) {
        case 3: return 'High';
        case 2: return 'Med';
        case 1: return 'Low';
        case 0: return 'None';
        default: return value.toString();
      }
    },
  };
  const getCurrentStressInfo = () => {
    // Check if we have the API response object with currentLevel
    if (stressResponse && typeof stressResponse === 'object' && stressResponse.currentLevel) {
      // Use the currentLevel from the API response
      const currentLevel = stressResponse.currentLevel;
      if (currentLevel === 'NO_DATA') {
        return { score: 'N/A', level: 'No Data', color: '#64748b' };
      }
      
      // Calculate score from level (approximate)
      let score = 'N/A';
      if (stressResponse.history && stressResponse.history.length > 0) {
        const latest = stressResponse.history[0]; // Most recent entry
        score = latest.score?.toFixed(1) || 'N/A';
      }
      
      return {
        score: score,
        level: currentLevel,
        color: getStressLevelColor(currentLevel),
      };
    }
    
    // Fallback to array-based data if available
    if (!stressData || stressData.length === 0) {
      return { score: 'N/A', level: 'No Data', color: '#64748b' };
    }

    const latest = stressData[stressData.length - 1];
    return {
      score: latest.stressScore?.toFixed(1) || 'N/A',
      level: latest.stressLevel || 'No Data',
      color: getStressLevelColor(latest.stressLevel),
    };
  };  const getTodayAnalysisCount = () => {
    // First check if studentStressInfo has totalAnalysesToday (from StudentStressDto)
    if (studentStressInfo && studentStressInfo.totalAnalysesToday !== undefined) {
      return studentStressInfo.totalAnalysesToday;
    }
    
    // Fallback: check student info (in case it has the field)
    if (studentInfo && studentInfo.totalAnalysesToday !== undefined) {
      return studentInfo.totalAnalysesToday;
    }
    
    // Fallback: check stress response history (API uses 'date' not 'analysisDate')
    if (stressResponse && stressResponse.history && Array.isArray(stressResponse.history)) {
      const today = new Date().toDateString();
      return stressResponse.history.filter(item => 
        new Date(item.date).toDateString() === today
      ).length;
    }
    
    // Final fallback to legacy array-based stress data
    if (!stressData) return 0;
    
    const today = new Date().toDateString();
    return stressData.filter(item => 
      new Date(item.analysisDate || item.date).toDateString() === today
    ).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading student details...</Text>
      </View>
    );
  }

  const currentStress = getCurrentStressInfo();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.studentEmail}>{studentInfo?.email || studentInfo?.username}</Text>
        </View>
      </View>

      {/* Current Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Stress Level</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLevel, { color: currentStress.color }]}>
              {currentStress.level}
            </Text>
            <Text style={styles.statusScore}>Score: {currentStress.score}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>        <View style={styles.statCard}>
          <Text style={styles.statValue}>{getTodayAnalysisCount()}</Text>
          <Text style={styles.statLabel}>Analyses Today</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{answers.length}</Text>
          <Text style={styles.statLabel}>Answers (7 days)</Text>
        </View>
      </View>      {/* Stress Trend Chart */}
      
      <View style={styles.answersContainer}>
        <Text style={styles.sectionTitle}>Recent Answers</Text>
        {answers.length > 0 ? (
          answers.slice(0, 5).map((answer, index) => (
            <View key={answer.answerId || index} style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <Text style={styles.answerDate}>
                  {formatDate(answer.answerDate)}
                </Text>
                <View style={styles.answerBadge}>
                  <Text style={styles.answerValue}>Answer: {answer.answerText}</Text>
                </View>
              </View>
              <Text style={styles.questionText} numberOfLines={2}>
                Q: {answer.questionText}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyAnswersContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyAnswersText}>No recent answers</Text>
            <Text style={styles.emptyAnswersSubtext}>
              This student hasn't answered any questions in the last 7 days
            </Text>
          </View>
        )}
      </View>

      {/* Empty state for stress data */}
      {stressData.length === 0 && answers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No data available</Text>
          <Text style={styles.emptySubtext}>
            This student hasn't completed any assessments yet
          </Text>
        </View>
      )}
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
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  studentEmail: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLevel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusScore: {
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
  },  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChartContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },  emptyChartSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  answersContainer: {
    margin: 20,
    marginBottom: 30,
  },
  answerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  answerBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },  answerValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    fontWeight: '500',
  },
  emptyAnswersContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
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
  emptyAnswersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  emptyAnswersSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});

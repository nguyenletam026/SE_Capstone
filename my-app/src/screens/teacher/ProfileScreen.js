import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Divider } from 'react-native-paper';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Đăng xuất thất bại. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Implement dark mode logic here
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // Implement notifications toggle logic here
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={user?.avatarUrl ? { uri: user.avatarUrl } : require('../../../assets/images/default-avatar.png')} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{user?.firstName || ''} {user?.lastName || ''}</Text>
        <Text style={styles.role}>Giáo viên</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        
        <View style={styles.infoItem}>
          <MaterialIcons name="person" size={22} color="#1890ff" />
          <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
          <Text style={styles.infoText}>{user?.username || 'Chưa có thông tin'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialIcons name="email" size={22} color="#1890ff" />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoText}>{user?.email || user?.username || 'Chưa có thông tin'}</Text>
        </View>
        
        {user?.phone && (
          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={22} color="#1890ff" />
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="lock" size={22} color="#1890ff" />
            <Text style={styles.settingText}>Đổi mật khẩu</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>
        
        <Divider style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="nightlight-round" size={22} color="#1890ff" />
            <Text style={styles.settingText}>Chế độ tối</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#e0e0e0", true: "#bae7ff" }}
            thumbColor={isDarkMode ? "#1890ff" : "#f5f5f5"}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="notifications" size={22} color="#1890ff" />
            <Text style={styles.settingText}>Thông báo</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#e0e0e0", true: "#bae7ff" }}
            thumbColor={notificationsEnabled ? "#1890ff" : "#f5f5f5"}
          />
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="info-outline" size={22} color="#1890ff" />
            <Text style={styles.settingText}>Về ứng dụng</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>
        
        <Divider style={styles.divider} />
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="help-outline" size={22} color="#1890ff" />
            <Text style={styles.settingText}>Trợ giúp & Hỗ trợ</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>
        
        <Divider style={styles.divider} />
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="security" size={22} color="#1890ff" />
            <Text style={styles.settingText}>Chính sách bảo mật</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialIcons name="logout" size={22} color="#fff" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </>
        )}
      </TouchableOpacity>
      
      <Text style={styles.version}>Phiên bản 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#1890ff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#1890ff',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
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
    marginLeft: 12,
    fontSize: 15,
    color: '#666',
    width: 100,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    backgroundColor: '#f0f0f0',
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 24,
    marginBottom: 30,
  }
});

export default ProfileScreen;
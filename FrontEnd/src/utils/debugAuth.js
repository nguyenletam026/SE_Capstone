// Debug utility to examine JWT token and user authentication state
import { getToken } from '../services/localStorageService';

export const debugAuthenticationState = () => {
  console.log('=== Authentication Debug Info ===');
  
  const token = getToken();
  if (!token) {
    console.log('❌ No token found in localStorage');
    return;
  }
  
  console.log('✅ Token found in localStorage');
  console.log('Token length:', token.length);
  
  try {
    // Decode JWT payload (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('📋 Token payload:', payload);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('⚠️ Token is EXPIRED');
      console.log('Expired at:', new Date(payload.exp * 1000));
    } else if (payload.exp) {
      console.log('✅ Token is valid until:', new Date(payload.exp * 1000));
    }
    
    // Check roles/scope
    if (payload.scope) {
      console.log('🔑 User roles/scope:', payload.scope);
      if (payload.scope.includes('ROLE_DOCTOR')) {
        console.log('✅ User has DOCTOR role');
      } else {
        console.log('❌ User does NOT have DOCTOR role');
        console.log('Available roles:', payload.scope);
      }
    }
    
    // User info
    if (payload.sub) {
      console.log('👤 Username:', payload.sub);
    }
    
    return {
      hasToken: true,
      isExpired: payload.exp && payload.exp < now,
      hasDoctoRole: payload.scope && payload.scope.includes('ROLE_DOCTOR'),
      username: payload.sub,
      roles: payload.scope,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null
    };
    
  } catch (error) {
    console.log('❌ Failed to decode token:', error);
    return { hasToken: true, error: 'Invalid token format' };
  }
};

export const testDoctorEarningsAPI = async () => {
  console.log('=== Testing Doctor Earnings API ===');
  
  const token = getToken();
  if (!token) {
    console.log('❌ No token available for API test');
    return;
  }
  
  try {
    const response = await fetch('https://stressbackend.shop/api/doctor/earnings/history', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error Response Body:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.log('❌ Parsed Error:', errorJson);
      } catch (e) {
        console.log('❌ Error response is not JSON');
      }
    } else {
      const data = await response.json();
      console.log('✅ API Success Response:', data);
    }
    
  } catch (error) {
    console.log('❌ Network/Fetch Error:', error);
  }
};

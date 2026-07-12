import React from 'react';
import LoadingScreen from '../components/LoadingScreen';

export default function AppLoadingScreen() {
  return (
    <LoadingScreen 
      message="مرحباً بك في النادي - منصة التعلم الذكية" 
      type="general"
      color="#4ECDC4"
    />
  );
}
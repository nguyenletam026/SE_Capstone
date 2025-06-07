import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const StressChart = ({ data }) => {
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View>
      <PieChart
        data={data}
        width={screenWidth - 80}
        height={220}
        chartConfig={chartConfig}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

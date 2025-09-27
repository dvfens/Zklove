import React from 'react';
import { Image, View } from 'react-native';

interface ZkLoveLogoProps {
  size?: number;
  style?: any;
}

export default function ZkLoveLogo({ size = 60, style }: ZkLoveLogoProps) {
  return (
    <View style={style}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={{
          width: size,
          height: size,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}

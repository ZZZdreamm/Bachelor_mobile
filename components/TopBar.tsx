import { Link } from "expo-router";
import { StyleSheet, Image } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface TopBarProps {
    title: string;
    navigationRef?: any;
}


export default function TopBar({ title, navigationRef = "/(tabs)" }: TopBarProps) {
    return (
        <ThemedView style={styles.pageContainer}>
            <ThemedView style={styles.headerContainer}>
                <Link href={navigationRef}>
                  <Image style={styles.backArrowImg} source={require('@/assets/images/back_arrow_white.png')}/>
                </Link>
                <ThemedText type="subtitle">{title}</ThemedText>
            </ThemedView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    pageContainer: {
      paddingLeft: 12,
      paddingRight: 16,
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      height: 50,
    },
    backArrowImg: {
      width: 40,
      height: 40,
    }
});
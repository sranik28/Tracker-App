import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Animated,
} from 'react-native';

interface TrackingButtonProps {
    isTracking: boolean;
    isLoading: boolean;
    onToggle: () => void;
}

export const TrackingButton: React.FC<TrackingButtonProps> = React.memo(
    ({ isTracking, isLoading, onToggle }) => {
        const pulseAnim = React.useRef(new Animated.Value(1)).current;

        React.useEffect(() => {
            if (isTracking) {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            } else {
                pulseAnim.setValue(1);
            }
        }, [isTracking]);

        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isTracking ? styles.activeButton : styles.inactiveButton,
                    ]}
                    onPress={onToggle}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Animated.View
                        style={[
                            styles.innerCircle,
                            { transform: [{ scale: pulseAnim }] },
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'LOADING...' : isTracking ? 'STOP' : 'START'}
                        </Text>
                        <Text style={styles.subText}>
                            {isTracking ? 'Tracking Active' : 'Tap to Start'}
                        </Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    activeButton: {
        backgroundColor: '#4CAF50',
    },
    inactiveButton: {
        backgroundColor: '#F44336',
    },
    innerCircle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subText: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.9,
    },
});

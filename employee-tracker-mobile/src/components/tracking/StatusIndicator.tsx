import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTimeSince } from '../../utils/helpers';

interface StatusIndicatorProps {
    status: 'active' | 'inactive' | 'syncing';
    lastSync?: Date;
    queuedLocations?: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(
    ({ status, lastSync, queuedLocations = 0 }) => {
        const getStatusColor = () => {
            switch (status) {
                case 'active':
                    return '#4CAF50';
                case 'inactive':
                    return '#F44336';
                case 'syncing':
                    return '#FF9800';
                default:
                    return '#9E9E9E';
            }
        };

        const getStatusText = () => {
            switch (status) {
                case 'active':
                    return 'Tracking Active';
                case 'inactive':
                    return 'Not Tracking';
                case 'syncing':
                    return 'Syncing...';
                default:
                    return 'Unknown';
            }
        };

        return (
            <View style={styles.container}>
                <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
                    <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>

                {lastSync && (
                    <Text style={styles.syncText}>
                        Last sync: {getTimeSince(lastSync)}
                    </Text>
                )}

                {queuedLocations > 0 && (
                    <Text style={styles.queueText}>
                        {queuedLocations} location{queuedLocations > 1 ? 's' : ''} queued
                    </Text>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    syncText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    queueText: {
        fontSize: 14,
        color: '#FF9800',
        marginTop: 4,
        fontWeight: '500',
    },
});

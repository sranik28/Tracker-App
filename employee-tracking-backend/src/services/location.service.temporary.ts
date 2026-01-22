
    async getActiveLocationsSnapshot() {
    // 1. Get all active sessions
    const activeSessions = await ActivitySession.find({
        status: ACTIVITY_STATUS.ON
    }).populate('employeeId', 'name email employeeId');

    // 2. For each session, get the latest location
    const snapshot = await Promise.all(activeSessions.map(async (session) => {
        const latestLocation = await LocationLog.findOne({
            sessionId: session._id
        })
            .sort({ timestamp: -1 })
            .select('latitude longitude accuracy timestamp')
            .lean();

        if (!latestLocation) return null;

        return {
            _id: latestLocation._id,
            employee: session.employeeId, // Populated employee details
            session: session,
            location: {
                type: 'Point',
                coordinates: [latestLocation.longitude, latestLocation.latitude]
            },
            accuracy: latestLocation.accuracy,
            timestamp: latestLocation.timestamp
        };
    }));

    // Filter out nulls (sessions with no location logs yet)
    return snapshot.filter(Boolean);
}

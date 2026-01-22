
    async getLocationSnapshot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        // Find all active sessions
        // access ActivitySession model directly or via service
        // Ideally should be in service but for speed injecting here with service call

        const snapshot = await locationService.getActiveLocationsSnapshot();

        sendSuccess(res, 'Active locations snapshot retrieved', snapshot, HTTP_STATUS.OK);
    } catch (error) {
        next(error);
    }
}

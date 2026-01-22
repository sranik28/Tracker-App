import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_tokens';

interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export const storage = {
    async saveTokens(tokens: Tokens): Promise<void> {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
        } catch (error) {
            console.error('Error saving tokens:', error);
            throw error;
        }
    },

    async getTokens(): Promise<Tokens | null> {
        try {
            const tokens = await SecureStore.getItemAsync(TOKEN_KEY);
            return tokens ? JSON.parse(tokens) : null;
        } catch (error) {
            console.error('Error getting tokens:', error);
            return null;
        }
    },

    async getAccessToken(): Promise<string | null> {
        const tokens = await this.getTokens();
        return tokens?.accessToken || null;
    },

    async getRefreshToken(): Promise<string | null> {
        const tokens = await this.getTokens();
        return tokens?.refreshToken || null;
    },

    async clearTokens(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
    },
};

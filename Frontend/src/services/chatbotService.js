import apiService from './api';

const chatbotService = {
    async sendMessage(message) {
        return apiService.post('/api/chatbot/chat', { message });
    },
};

export default chatbotService;

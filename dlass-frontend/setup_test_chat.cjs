const axios = require('axios');
const API = "http://localhost:8080/api";

async function main() {
    try {
        console.log("Registering User");
        await axios.post(`${API}/users`, {
            fullName: "Chat User",
            email: "chatuser8@example.com",
            password: "Password123!",
            role: "USER"
        });

        console.log("Registering Provider User account");
        await axios.post(`${API}/users`, {
            fullName: "Chat Provider",
            email: "chatprovider8@example.com",
            password: "Password123!",
            role: "USER" // Provider registers as user first
        });

        // Login User
        console.log("Login User");
        const userRes = await axios.post(`${API}/auth/login`, {
            email: "chatuser8@example.com",
            password: "Password123!"
        });
        const userToken = userRes.data.token;
        const userMe = await axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${userToken}` }});
        const userId = userMe.data.id;

        // Login Provider
        console.log("Login Provider");
        const provRes = await axios.post(`${API}/auth/login`, {
            email: "chatprovider8@example.com",
            password: "Password123!"
        });
        let provToken = provRes.data.token;
        
        console.log("Registering as Provider via authenticated endpoint");
        await axios.post(`${API}/providers/register`, {
            businessName: "Test Provider Business",
            phone: "1234567890",
        }, { headers: { Authorization: `Bearer ${provToken}` }});
        
        // Refresh provider info
        const provMe = await axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${provToken}` }});
        const provId = provMe.data.id;

        console.log("Initiating Chat from User to Provider");
        await axios.post(`${API}/chat`, {
            receiverId: provId,
            message: "Hello Provider, I want to book an appointment!"
        }, { headers: { Authorization: `Bearer ${userToken}` }});
        
        console.log("Initiating Reply from Provider to User");
        await axios.post(`${API}/chat`, {
            receiverId: userId,
            message: "Hi there! I am happy to help you."
        }, { headers: { Authorization: `Bearer ${provToken}` }});

        console.log("Setup complete! User ID:", userId, "- Provider ID:", provId);

    } catch (e) {
        console.error("Error setting up chat test:");
        console.error(e.response?.data || e.message);
    }
}
main();

const AuthService = require('../lib/auth-service');

let authServiceInstance = null;

function getAuthService() {
    if (!authServiceInstance) {
        authServiceInstance = new AuthService();
    }
    return authServiceInstance;
}

module.exports = async function handler(req, res) {
    try {
        const authService = getAuthService();

        if (req.method === 'POST') {
            const { action, email, password } = req.body;

            if (action === 'login') {
                // Handle login
                if (!email || !password) {
                    return res.status(400).json({ 
                        error: 'Email and password are required' 
                    });
                }

                const result = await authService.signIn(email, password);
                
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        user: {
                            id: result.user.id,
                            email: result.user.email
                        },
                        session: {
                            access_token: result.session.access_token,
                            expires_at: result.session.expires_at
                        }
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        error: result.error
                    });
                }

            } else if (action === 'logout') {
                // Handle logout
                const result = await authService.signOut();
                
                res.status(200).json(result);

            } else {
                res.status(400).json({ 
                    error: 'Invalid action. Use "login" or "logout"' 
                });
            }

        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
        }

    } catch (error) {
        console.error('Auth API Error:', error);
        res.status(500).json({ error: 'Authentication service error' });
    }
}; 
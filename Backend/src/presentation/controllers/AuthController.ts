import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';

export class AuthController {
  constructor(private readonly authService: AuthService) { }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.register(email, password);
      res.status(201).json({ message: 'User registered successfully', userId: user.userId, email: user.email });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);
      res.status(200).json({ message: 'Login successful', userId: user.userId, email: user.email, token });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await this.authService.logout(token);
      }
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public validateSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ valid: false, message: 'No token provided' });
        return;
      }

      const user = await this.authService.validateSession(token);
      if (!user) {
        res.status(401).json({ valid: false, message: 'Invalid or expired session' });
        return;
      }

      res.status(200).json({ valid: true, userId: user.userId, email: user.email });
    } catch (error: any) {
      res.status(500).json({ valid: false, error: error.message });
    }
  };
}

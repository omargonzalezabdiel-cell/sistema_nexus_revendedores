import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, setLocation } from '../hooks/useNavigation';
import { Input, Button } from '../components/ui';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      const isAdmin = formData.email.includes('admin');
      navigate(isAdmin ? '/admin/dashboard' : '/reseller/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Credenciales invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-darker flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src="/mi_logo.png" alt="NEXUS" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-nexus-gold mb-2">NEXUS</h1>
          <p className="text-gray-400">Sistema de Gestion Premium</p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.1] rounded-2xl p-8 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Contrasena"
              type="password"
              placeholder="--------"
              icon={<Lock className="w-4 h-4" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              <ArrowRight className="w-4 h-4" />
              Iniciar Sesion
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.1]">
            <p className="text-center text-gray-400 text-sm">
              No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setLocation('/register')}
                className="text-nexus-gold font-semibold hover:text-nexus-gold-light transition-colors"
              >
                Registrate aqui
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          2026 NEXUS. Sistema de Gestion Empresarial Premium.
        </p>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, setLocation } from '../hooks/useNavigation';
import { Input, Button } from '../components/ui';
import { Mail, Lock, User, Building2, ArrowRight, ArrowLeft, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
  });

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Email invalido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contrasenas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.companyName,
        formData.phone
      );
      navigate('/reseller/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Error al crear la cuenta');
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
          <p className="text-gray-400">Crear Cuenta de Revendedor</p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.1] rounded-2xl p-8 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    step >= s ? 'bg-nexus-gold' : 'bg-white/[0.1]'
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h2 className="text-lg font-semibold text-white">Informacion Personal</h2>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    placeholder="Juan"
                    icon={<User className="w-4 h-4" />}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Apellido"
                    placeholder="Garcia"
                    icon={<User className="w-4 h-4" />}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

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
                  label="Telefono"
                  type="tel"
                  placeholder="+507 6498-7682"
                  icon={<Phone className="w-4 h-4" />}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h2 className="text-lg font-semibold text-white">Seguridad</h2>

                <Input
                  label="Contrasena"
                  type="password"
                  placeholder="--------"
                  icon={<Lock className="w-4 h-4" />}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />

                <Input
                  label="Confirmar Contrasena"
                  type="password"
                  placeholder="--------"
                  icon={<Lock className="w-4 h-4" />}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-200">
                    La contrasena debe tener al menos 6 caracteres.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h2 className="text-lg font-semibold text-white">Tu Empresa</h2>

                <Input
                  label="Nombre de la Empresa"
                  placeholder="Mi Empresa SRL"
                  icon={<Building2 className="w-4 h-4" />}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />

                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-200">
                    Tu cuenta sera creada como revendedor. Un administrador debe aprobar tu cuenta antes de que puedas crear pedidos.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(step - 1)}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="flex-1"
                >
                  Anterior
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(step + 1)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="flex-1"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="flex-1"
                >
                  Crear Cuenta
                </Button>
              )}
            </div>

            <div className="text-center pt-4 border-t border-white/[0.1]">
              <p className="text-gray-400 text-sm">
                Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setLocation('/login')}
                  className="text-nexus-gold font-semibold hover:text-nexus-gold-light transition-colors"
                >
                  Inicia sesion aqui
                </button>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          2026 NEXUS. Sistema de Gestion Empresarial Premium.
        </p>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { Input, Button, GlassCard } from '../components/ui';
import { User, Mail, Phone, Building, MapPin, Award, Zap, ShoppingCart, Save, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';

const LEVEL_CONFIG: Record<string, { name: string; color: string }> = {
  basic: { name: 'Basico', color: 'text-gray-400' },
  pro: { name: 'Pro', color: 'text-blue-400' },
  micro_brand: { name: 'Micro Marca', color: 'text-nexus-gold' },
  distributor: { name: 'Distribuidor', color: 'text-nexus-accent' },
};

export const ResellerProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    address: user?.address || '',
    province: user?.province || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await authService.updateProfile(user?.id || '', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        company_name: formData.company_name,
        address: formData.address,
        province: formData.province,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const currentLevel = user?.level || 'basic';
  const levelInfo = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG.basic;

  return (
    <MainLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-gray-400">Administra tu informacion personal</p>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-nexus-gold to-nexus-gold-light flex items-center justify-center text-black text-2xl font-bold flex-shrink-0">
                {(user?.first_name?.[0] || '').toUpperCase()}{(user?.last_name?.[0] || '').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white">{user?.first_name} {user?.last_name}</h2>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.05] ${levelInfo.color}`}>
                    {levelInfo.name}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Read-only Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="text-center">
              <Award className="w-6 h-6 text-nexus-gold mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{levelInfo.name}</p>
              <p className="text-xs text-gray-500">Nivel</p>
            </GlassCard>
            <GlassCard className="text-center">
              <Zap className="w-6 h-6 text-nexus-accent mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{user?.xp || 0}</p>
              <p className="text-xs text-gray-500">XP</p>
            </GlassCard>
            <GlassCard className="text-center">
              <ShoppingCart className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{user?.sales_count || 0}</p>
              <p className="text-xs text-gray-500">Ventas</p>
            </GlassCard>
          </div>
        </motion.div>

        {/* Editable Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-nexus-gold" />
              Informacion Personal
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Apellido"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Tu apellido"
                  icon={<User className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Telefono"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+507 6498-7682"
                icon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Nombre de Empresa"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Mi Empresa S.A."
                icon={<Building className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Provincia"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  placeholder="Panama"
                  icon={<MapPin className="w-4 h-4" />}
                />
                <Input
                  label="Direccion"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Calle Principal"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Success message */}
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-sm text-green-400">Perfil actualizado exitosamente</p>
                </motion.div>
              )}

              {/* Save button */}
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSave}
                  loading={saving}
                  icon={saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                >
                  {saved ? 'Guardado' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Account Info (read-only) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-nexus-accent" />
              Informacion de Cuenta
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Email</span>
                </div>
                <span className="text-sm text-white font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Rol</span>
                </div>
                <span className="text-sm text-white font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Aprobado</span>
                </div>
                <span className={`text-sm font-medium ${user?.approved ? 'text-green-400' : 'text-yellow-400'}`}>
                  {user?.approved ? 'Si' : 'Pendiente'}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

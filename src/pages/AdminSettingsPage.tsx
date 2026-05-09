import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, StatCard, Button, Input } from '../components/ui';
import { Settings, Truck, Plus, Trash2, CreditCard as Edit3, Save, X, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// ---------- Types ----------
interface ShippingCompany {
  id: string;
  name: string;
  cost: number;
  active: boolean;
  created_at: string;
}

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  label: string;
}

interface ResellerLevel {
  id: string;
  level: string;
  name: string;
  min_sales: number;
  monthly_goal: number;
  xp_required: number;
  discount: number;
}

// ---------- Constants ----------
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-gray-500/20 text-gray-300',
  pro: 'bg-blue-500/20 text-blue-300',
  micro_brand: 'bg-nexus-gold/20 text-nexus-gold',
  distributor: 'bg-purple-500/20 text-purple-300',
};

const Skeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.1] p-6 space-y-3">
    <div className="h-4 bg-white/[0.06] rounded w-1/2" />
    <div className="h-6 bg-white/[0.06] rounded w-2/3" />
    <div className="h-4 bg-white/[0.06] rounded w-1/2" />
  </div>
);

export const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Shipping companies
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', cost: 0 });
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editCompanyData, setEditCompanyData] = useState({ name: '', cost: 0 });

  // Platform settings
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editSettingValue, setEditSettingValue] = useState('');

  // Reseller levels
  const [levels, setLevels] = useState<ResellerLevel[]>([]);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editLevelData, setEditLevelData] = useState<Partial<ResellerLevel>>({});

  const loadData = useCallback(async () => {
    try {
      const [companiesRes, settingsRes, levelsRes] = await Promise.all([
        supabase.from('shipping_companies').select('*').order('name'),
        supabase.from('settings').select('*').order('key'),
        supabase.from('reseller_levels').select('*').order('min_sales'),
      ]);

      setShippingCompanies((companiesRes.data || []) as ShippingCompany[]);
      setSettings((settingsRes.data || []) as PlatformSetting[]);
      setLevels((levelsRes.data || []) as ResellerLevel[]);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Shipping Companies ----
  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('shipping_companies').insert([{
        name: newCompany.name,
        cost: newCompany.cost,
        active: true,
      }]);
      if (error) throw error;
      setNewCompany({ name: '', cost: 0 });
      setShowAddCompany(false);
      await loadData();
    } catch (err) {
      console.error('Error adding company:', err);
    }
    setSaving(false);
  };

  const handleToggleCompany = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('shipping_companies')
        .update({ active: !currentActive })
        .eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error toggling company:', err);
    }
  };

  const handleSaveCompany = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('shipping_companies')
        .update({
          name: editCompanyData.name,
          cost: editCompanyData.cost,
        })
        .eq('id', id);
      if (error) throw error;
      setEditingCompany(null);
      await loadData();
    } catch (err) {
      console.error('Error updating company:', err);
    }
    setSaving(false);
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Seguro que deseas eliminar esta compania?')) return;
    try {
      const { error } = await supabase.from('shipping_companies').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  // ---- Platform Settings ----
  const handleSaveSetting = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: editSettingValue })
        .eq('id', id);
      if (error) throw error;
      setEditingSetting(null);
      await loadData();
    } catch (err) {
      console.error('Error updating setting:', err);
    }
    setSaving(false);
  };

  // ---- Reseller Levels ----
  const handleSaveLevel = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('reseller_levels')
        .update(editLevelData)
        .eq('id', id);
      if (error) throw error;
      setEditingLevel(null);
      await loadData();
    } catch (err) {
      console.error('Error updating level:', err);
    }
    setSaving(false);
  };

  const activeCompanies = shippingCompanies.filter((c) => c.active).length;

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} />)}
          </div>
          <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Configuracion del Sistema</h1>
          <p className="text-gray-400">Administra companias de envio, ajustes y niveles</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item}>
            <StatCard
              label="Companias de Envio"
              value={shippingCompanies.length}
              icon={<Truck className="w-6 h-6 text-nexus-gold" />}
              subtext={`${activeCompanies} activas`}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Ajustes de Plataforma"
              value={settings.length}
              icon={<Settings className="w-6 h-6 text-nexus-accent" />}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Niveles de Revendedor"
              value={levels.length}
              icon={<Shield className="w-6 h-6 text-purple-400" />}
            />
          </motion.div>
        </motion.div>

        {/* Shipping Companies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-nexus-gold" />
                Companias de Envio
              </h3>
              <Button
                variant={showAddCompany ? 'outline' : 'primary'}
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddCompany(!showAddCompany)}
              >
                {showAddCompany ? 'Cancelar' : 'Agregar'}
              </Button>
            </div>

            <AnimatePresence>
              {showAddCompany && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 pb-4 border-t border-white/[0.05] space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Nombre"
                        placeholder="Ej: Cargo Express"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        label="Costo Base ($)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newCompany.cost || ''}
                        onChange={(e) => setNewCompany((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
                      />
                      <div className="flex items-end">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleAddCompany}
                          loading={saving}
                          disabled={!newCompany.name.trim()}
                          icon={<Save className="w-4 h-4" />}
                          className="w-full"
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {shippingCompanies.length > 0 ? shippingCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 bg-white/[0.02] rounded-xl border transition-colors ${
                    company.active
                      ? 'border-white/[0.05] hover:border-white/[0.1]'
                      : 'border-white/[0.05] opacity-50'
                  }`}
                >
                  {editingCompany === company.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Nombre"
                        value={editCompanyData.name}
                        onChange={(e) => setEditCompanyData((p) => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        label="Costo"
                        type="number"
                        step="0.01"
                        value={editCompanyData.cost || ''}
                        onChange={(e) => setEditCompanyData((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
                      />
                      <div className="flex items-end gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveCompany(company.id)}
                          loading={saving}
                          icon={<Save className="w-3 h-3" />}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCompany(null)}
                          icon={<X className="w-3 h-3" />}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{company.name}</p>
                        <p className="text-sm text-gray-400">Costo base: ${Number(company.cost).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleCompany(company.id, company.active)}
                          className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                          title={company.active ? 'Desactivar' : 'Activar'}
                        >
                          {company.active ? (
                            <ToggleRight className="w-5 h-5 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCompany(company.id);
                            setEditCompanyData({ name: company.name, cost: company.cost });
                          }}
                          className="text-xs px-2 py-1"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCompany(company.id)}
                          className="text-xs px-2 py-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-8 text-center text-gray-500">
                  <Truck className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No hay companias de envio registradas</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Platform Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-nexus-accent" />
              Ajustes de Plataforma
            </h3>

            <div className="space-y-3">
              {settings.length > 0 ? settings.map((setting) => (
                <div
                  key={setting.id}
                  className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]"
                >
                  {editingSetting === setting.id ? (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-300 mb-1">{setting.label || setting.key}</p>
                        <Input
                          value={editSettingValue}
                          onChange={(e) => setEditSettingValue(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 mt-5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveSetting(setting.id)}
                          loading={saving}
                          icon={<Save className="w-3 h-3" />}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSetting(null)}
                          icon={<X className="w-3 h-3" />}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300">{setting.label || setting.key}</p>
                        <p className="text-lg font-semibold text-white">{setting.value}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSetting(setting.id);
                          setEditSettingValue(setting.value);
                        }}
                        icon={<Edit3 className="w-3 h-3" />}
                      >
                        Editar
                      </Button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-8 text-center text-gray-500">
                  <Settings className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No hay ajustes configurados</p>
                  <p className="text-xs mt-1">Agrega ajustes en la tabla 'settings' de Supabase</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Reseller Levels */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Configuracion de Niveles
            </h3>

            <div className="space-y-3">
              {levels.length > 0 ? levels.map((level) => (
                <div
                  key={level.id}
                  className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]"
                >
                  {editingLevel === level.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nombre</p>
                          <Input
                            value={editLevelData.name || ''}
                            onChange={(e) => setEditLevelData((p) => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ventas Minimas</p>
                          <Input
                            type="number"
                            value={editLevelData.min_sales ?? ''}
                            onChange={(e) => setEditLevelData((p) => ({ ...p, min_sales: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Meta Mensual ($)</p>
                          <Input
                            type="number"
                            value={editLevelData.monthly_goal ?? ''}
                            onChange={(e) => setEditLevelData((p) => ({ ...p, monthly_goal: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">XP Requerido</p>
                          <Input
                            type="number"
                            value={editLevelData.xp_required ?? ''}
                            onChange={(e) => setEditLevelData((p) => ({ ...p, xp_required: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveLevel(level.id)}
                          loading={saving}
                          icon={<Save className="w-3 h-3" />}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLevel(null)}
                          icon={<X className="w-3 h-3" />}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${LEVEL_COLORS[level.level] || LEVEL_COLORS.basic}`}>
                          {level.level.toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{level.name}</p>
                          <div className="flex gap-4 text-xs text-gray-400 mt-1">
                            <span>Min. Ventas: {level.min_sales}</span>
                            <span>Meta: ${level.monthly_goal?.toLocaleString() || 0}</span>
                            <span>XP: {level.xp_required || 0}</span>
                            {level.discount > 0 && <span>Descuento: {level.discount}%</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingLevel(level.id);
                          setEditLevelData({ ...level });
                        }}
                        icon={<Edit3 className="w-3 h-3" />}
                      >
                        Editar
                      </Button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-8 text-center text-gray-500">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No hay niveles configurados</p>
                  <p className="text-xs mt-1">Agrega niveles en la tabla 'reseller_levels' de Supabase</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

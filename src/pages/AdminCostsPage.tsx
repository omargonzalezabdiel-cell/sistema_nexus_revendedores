import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, Input, Button } from '../components/ui';
import { Save, AlertCircle, RotateCcw, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { CostRow } from '../services/costsService';

const COST_FIELDS: { key: keyof CostRow; label: string; suffix: string; category: string }[] = [
  { key: 'material_cost', label: 'Material', suffix: '$', category: 'production' },
  { key: 'ink_cost', label: 'Tinta', suffix: '$', category: 'production' },
  { key: 'paper_cost', label: 'Papel', suffix: '$', category: 'production' },
  { key: 'electricity_cost', label: 'Electricidad', suffix: '$', category: 'production' },
  { key: 'labor_cost', label: 'Mano de Obra', suffix: '$', category: 'production' },
  { key: 'packaging_cost', label: 'Empaque', suffix: '$', category: 'production' },
  { key: 'shipping_cost', label: 'Envio Base', suffix: '$', category: 'production' },
  { key: 'maintenance_cost', label: 'Mantenimiento', suffix: '$', category: 'production' },
];

const MARGIN_FIELDS: { key: keyof CostRow; label: string; suffix: string }[] = [
  { key: 'reseller_margin', label: 'Margen Revendedor', suffix: '%' },
  { key: 'nexus_margin', label: 'Margen NEXUS', suffix: '%' },
  { key: 'platform_commission', label: 'Comision Plataforma', suffix: '%' },
];

const CATEGORY_LABELS: Record<string, string> = {
  production: 'Costos de Produccion (por unidad)',
  margins: 'Margenes y Comisiones',
};

export const AdminCostsPage: React.FC = () => {
  const { costs, loading, updateCosts } = useData();
  const [editingCosts, setEditingCosts] = useState<Partial<CostRow>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (costs) {
      setEditingCosts({ ...costs });
    }
  }, [costs]);

  const handleCostChange = (field: keyof CostRow, value: string) => {
    const num = parseFloat(value) || 0;
    setEditingCosts((prev) => ({ ...prev, [field]: num }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<CostRow> = {};
      COST_FIELDS.forEach(({ key }) => {
        if (editingCosts[key] !== undefined) (updates as any)[key] = Number(editingCosts[key]);
      });
      MARGIN_FIELDS.forEach(({ key }) => {
        if (editingCosts[key] !== undefined) (updates as any)[key] = Number(editingCosts[key]);
      });
      await updateCosts(updates);
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving costs:', err);
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    if (costs) {
      setEditingCosts({ ...costs });
      setHasChanges(false);
    }
  };

  // Calculate preview for 100 units
  const unitCost = COST_FIELDS.reduce(
    (sum, { key }) => sum + (Number(editingCosts[key]) || 0),
    0
  );
  const shippingBase = Number(editingCosts.shipping_cost) || 0;
  const resellerMargin = (Number(editingCosts.reseller_margin) || 0) / 100;
  const nexusMargin = (Number(editingCosts.nexus_margin) || 0) / 100;
  const commission = (Number(editingCosts.platform_commission) || 0) / 100;

  const previewQty = 100;
  const previewProduction = unitCost * previewQty;
  const previewShipping = shippingBase;
  const previewBase = previewProduction + previewShipping;
  const previewResellerProfit = previewBase * resellerMargin;
  const previewNexusProfit = previewBase * nexusMargin;
  const previewCommission = previewBase * commission;
  const previewTotal = previewBase + previewResellerProfit + previewNexusProfit + previewCommission;

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
          <div className="h-48 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Gestion de Costos</h1>
          <p className="text-gray-400">Configura la estructura de costos y margenes de produccion</p>
        </motion.div>

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard>
            <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">Importante</p>
                <p>Los costos unitarios se suman para calcular el costo base de produccion. Los margenes (%) se aplican sobre el precio base (produccion + envio). Estos valores se utilizan automaticamente para calcular ganancias en cada pedido.</p>
              </div>
            </div>

            {/* Production Costs */}
            <h3 className="text-base font-semibold text-white mb-4">
              {CATEGORY_LABELS.production}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {COST_FIELDS.map((field, i) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                >
                  <Input
                    label={field.label}
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingCosts[field.key] ?? 0}
                    onChange={(e) => handleCostChange(field.key, e.target.value)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Margins */}
            <h3 className="text-base font-semibold text-white mb-4 pt-4 border-t border-white/[0.05]">
              {CATEGORY_LABELS.margins}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {MARGIN_FIELDS.map((field, i) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                >
                  <Input
                    label={field.label}
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={editingCosts[field.key] ?? 0}
                    onChange={(e) => handleCostChange(field.key, e.target.value)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Preview Calculation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-white/[0.02] rounded-xl border border-white/[0.05] mb-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-nexus-gold" />
                Proyeccion de Calculo ({previewQty} unidades)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <p className="text-gray-400">Costo Unitario</p>
                  <p className="font-semibold text-white">${unitCost.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <p className="text-gray-400">Costo Total Produccion ({previewQty} uds)</p>
                  <p className="font-semibold text-white">${previewProduction.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <p className="text-gray-400">Envio Base</p>
                  <p className="font-semibold text-white">${previewShipping.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <p className="text-gray-400">Precio Base</p>
                  <p className="font-semibold text-white">${previewBase.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <p className="text-gray-400">Ganancia Revendedor ({(resellerMargin * 100).toFixed(0)}%)</p>
                  <p className="font-semibold text-nexus-gold">${previewResellerProfit.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <p className="text-gray-400">Ganancia NEXUS ({(nexusMargin * 100).toFixed(0)}%)</p>
                  <p className="font-semibold text-nexus-accent">${previewNexusProfit.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <p className="text-gray-400">Comision Plataforma ({(commission * 100).toFixed(0)}%)</p>
                  <p className="font-semibold text-purple-400">${previewCommission.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <p className="text-white font-semibold">Precio Total Final</p>
                  <p className="text-2xl font-bold text-nexus-gold">${previewTotal.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            {/* Save / Discard */}
            <div className="flex gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges}
                icon={<Save className="w-4 h-4" />}
                className="flex-1"
              >
                Guardar Cambios
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDiscard}
                disabled={!hasChanges}
                icon={<RotateCcw className="w-4 h-4" />}
                className="flex-1"
              >
                Descartar
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Last Updated */}
        {costs?.updated_at && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Historico</h3>
              <div className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">Ultima actualizacion</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(costs.updated_at).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-nexus-gold/20 text-nexus-gold rounded-full">Vigente</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

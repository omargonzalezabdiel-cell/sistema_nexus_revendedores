import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, Button, Input } from '../components/ui';
import {
  Bell, Send, Trash2, Eye, EyeOff, Plus,
  Megaphone, AlertCircle, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  info: 'Informacion',
  warning: 'Advertencia',
  success: 'Exito',
  announcement: 'Anuncio',
  maintenance: 'Mantenimiento',
};

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  success: 'bg-green-500/20 text-green-300 border-green-500/30',
  announcement: 'bg-nexus-gold/20 text-nexus-gold border-nexus-gold/30',
  maintenance: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Skeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.1] p-6 space-y-3">
    <div className="h-4 bg-white/[0.06] rounded w-1/3" />
    <div className="h-6 bg-white/[0.06] rounded w-2/3" />
    <div className="h-4 bg-white/[0.06] rounded w-1/2" />
  </div>
);

export const AdminNotificationsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    expires_at: '',
  });

  const loadAnnouncements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (err) {
      console.error('Error loading announcements:', err);
      // If the table doesn't exist yet, set empty
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSaving(true);
    try {
      const insertData: any = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        active: true,
      };
      if (formData.expires_at) {
        insertData.expires_at = new Date(formData.expires_at).toISOString();
      }

      const { error } = await supabase.from('announcements').insert([insertData]);
      if (error) throw error;

      setFormData({ title: '', content: '', type: 'announcement', expires_at: '' });
      setShowCreateForm(false);
      await loadAnnouncements();
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
    setSaving(false);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ active: !currentActive })
        .eq('id', id);
      if (error) throw error;
      await loadAnnouncements();
    } catch (err) {
      console.error('Error toggling announcement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Seguro que deseas eliminar este anuncio?')) return;
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
    setDeleting(null);
  };

  const activeCount = announcements.filter((a) => a.active).length;
  const expiredCount = announcements.filter(
    (a) => a.expires_at && new Date(a.expires_at) < new Date()
  ).length;

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
          <h1 className="text-4xl font-bold text-white mb-2">Gestion de Anuncios</h1>
          <p className="text-gray-400">Crea y administra anuncios globales para la plataforma</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Anuncios</p>
                  <h3 className="text-3xl font-bold text-white">{announcements.length}</h3>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.05] border border-white/[0.1]">
                  <Megaphone className="w-6 h-6 text-nexus-gold" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Activos</p>
                  <h3 className="text-3xl font-bold text-green-400">{activeCount}</h3>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Eye className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
          <motion.div variants={item}>
            <GlassCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Expirados</p>
                  <h3 className="text-3xl font-bold text-red-400">{expiredCount}</h3>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Create Announcement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Crear Anuncio Global</h3>
              <Button
                variant={showCreateForm ? 'outline' : 'primary'}
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Cancelar' : 'Nuevo Anuncio'}
              </Button>
            </div>

            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/[0.05] space-y-4">
                    <Input
                      label="Titulo del Anuncio"
                      placeholder="Ej: Mantenimiento programado"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Contenido</label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                        placeholder="Describe el anuncio..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:border-nexus-gold focus:ring-2 focus:ring-nexus-gold/20 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                          className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-nexus-gold focus:ring-2 focus:ring-nexus-gold/20 transition-all"
                        >
                          {Object.entries(TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key} className="bg-nexus-darker">{label}</option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Fecha de Expiracion (opcional)"
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData((p) => ({ ...p, expires_at: e.target.value }))}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleCreate}
                      loading={saving}
                      disabled={!formData.title.trim() || !formData.content.trim()}
                      icon={<Send className="w-4 h-4" />}
                      className="w-full"
                    >
                      Publicar Anuncio
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Announcements List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-nexus-accent" />
              Anuncios Existentes
            </h3>

            <div className="space-y-3">
              {announcements.length > 0 ? announcements.map((announcement) => {
                const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();
                return (
                  <div
                    key={announcement.id}
                    className={`p-4 bg-white/[0.02] rounded-xl border transition-colors ${
                      !announcement.active
                        ? 'border-white/[0.05] opacity-60'
                        : isExpired
                          ? 'border-red-500/20'
                          : 'border-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[announcement.type] || TYPE_COLORS.info}`}>
                            {TYPE_LABELS[announcement.type] || announcement.type}
                          </span>
                          {!announcement.active && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                              Inactivo
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                              Expirado
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-white">{announcement.title}</p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{announcement.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          {announcement.expires_at && (
                            <span>Expira: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(announcement.id, announcement.active)}
                          icon={announcement.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          className="text-xs px-2 py-1"
                        >
                          {announcement.active ? 'Ocultar' : 'Mostrar'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                          loading={deleting === announcement.id}
                          icon={<Trash2 className="w-3 h-3" />}
                          className="text-xs px-2 py-1"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-12 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay anuncios</p>
                  <p className="text-sm mt-1">Crea el primer anuncio global</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

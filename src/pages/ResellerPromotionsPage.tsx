import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard } from '../components/ui';
import { Megaphone, Tag, Newspaper, AlertTriangle, CalendarDays, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
  promotion: {
    label: 'Promocion',
    icon: <Tag className="w-5 h-5" />,
    color: 'text-nexus-gold',
    bgColor: 'bg-nexus-gold/10',
    borderColor: 'border-nexus-gold/20',
  },
  news: {
    label: 'Noticia',
    icon: <Newspaper className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  update: {
    label: 'Actualizacion',
    icon: <ArrowUp className="w-5 h-5" />,
    color: 'text-nexus-accent',
    bgColor: 'bg-nexus-accent/10',
    borderColor: 'border-nexus-accent/20',
  },
  alert: {
    label: 'Alerta',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
};

const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-32 bg-white/[0.05] rounded-xl" />
    ))}
  </div>
);

export const ResellerPromotionsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnnouncements((data || []) as Announcement[]);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        // If table doesn't exist yet, just show empty
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();

    // Subscribe to new announcements
    const channel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements',
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Promociones y Anuncios</h1>
          <p className="text-gray-400">Mantente informado sobre las ultimas novedades de NEXUS</p>
        </motion.div>

        {/* Announcements */}
        {loading ? (
          <GlassCard><Skeleton /></GlassCard>
        ) : announcements.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {announcements.map((announcement) => {
              const typeConfig = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.news;
              return (
                <motion.div key={announcement.id} variants={item}>
                  <GlassCard className={`${typeConfig.borderColor}`}>
                    <div className="space-y-4">
                      {/* Type badge and date */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${typeConfig.bgColor} ${typeConfig.color}`}>
                          {typeConfig.icon}
                          {typeConfig.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(announcement.created_at).toLocaleDateString('es-PA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white">{announcement.title}</h3>

                      {/* Content */}
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{announcement.content}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <GlassCard>
            <div className="text-center py-16">
              <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Sin anuncios activos</h3>
              <p className="text-gray-500 text-sm">No hay promociones o anuncios en este momento. Vuelve pronto!</p>
            </div>
          </GlassCard>
        )}
      </div>
    </MainLayout>
  );
};

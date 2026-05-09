import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, StatCard, Button, Input } from '../components/ui';
import {
  Shield, Users, Unlock, Lock, Trash2, Plus,
  UserCheck, Eye, EyeOff, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, UserRow } from '../services/userService';
import { notificationService } from '../services/notificationService';

const ROLE_OPTIONS = ['reseller', 'admin', 'super_admin'];

const LEVEL_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  micro_brand: 'Micro Brand',
  distributor: 'Distributor',
};

const LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-gray-500/20 text-gray-300',
  pro: 'bg-blue-500/20 text-blue-300',
  micro_brand: 'bg-nexus-gold/20 text-nexus-gold',
  distributor: 'bg-purple-500/20 text-purple-300',
};

const ROLE_LABELS: Record<string, string> = {
  reseller: 'Revendedor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Skeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.1] p-6 space-y-3">
    <div className="h-4 bg-white/[0.06] rounded w-1/2" />
    <div className="h-6 bg-white/[0.06] rounded w-3/4" />
    <div className="h-3 bg-white/[0.06] rounded w-1/3" />
  </div>
);

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create admin form
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Create reseller form
  const [showCreateReseller, setShowCreateReseller] = useState(false);
  const [newReseller, setNewReseller] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    auto_approve: true,
  });
  const [showResellerPassword, setShowResellerPassword] = useState(false);
  const [creatingReseller, setCreatingReseller] = useState(false);
  const [resellerError, setResellerError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resellers = allUsers.filter((u) => u.role === 'reseller');
  const admins = allUsers.filter((u) => u.role === 'admin' || u.role === 'super_admin');
  const pendingApproval = resellers.filter((u) => !u.approved && !u.blocked);

  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allUsers;

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await userService.approveUser(userId);
      await notificationService.createNotification({
        user_id: userId,
        title: 'Cuenta Aprobada',
        message: 'Tu cuenta ha sido aprobada. Ya puedes comenzar a crear pedidos.',
        type: 'success',
      });
      await loadUsers();
    } catch (err) {
      console.error('Error approving user:', err);
    }
    setActionLoading(null);
  };

  const handleBlock = async (userId: string) => {
    setActionLoading(userId);
    try {
      await userService.blockUser(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error blocking user:', err);
    }
    setActionLoading(null);
  };

  const handleUnblock = async (userId: string) => {
    setActionLoading(userId);
    try {
      await userService.unblockUser(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
    setActionLoading(null);
  };

  const handleChangeRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      await userService.changeRole(userId, role);
      await loadUsers();
    } catch (err) {
      console.error('Error changing role:', err);
    }
    setActionLoading(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Seguro que deseas eliminar este usuario? Esta accion es irreversible.')) return;
    setActionLoading(userId);
    try {
      await userService.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
    setActionLoading(null);
  };

  const handleCreateAdmin = async () => {
    setError('');
    if (!newAdmin.email || !newAdmin.password || !newAdmin.first_name || !newAdmin.last_name) {
      setError('Todos los campos son requeridos');
      return;
    }
    if (newAdmin.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    setCreating(true);
    try {
      await userService.createAdmin(newAdmin.email, newAdmin.password, newAdmin.first_name, newAdmin.last_name);
      setNewAdmin({ email: '', password: '', first_name: '', last_name: '' });
      setShowCreateAdmin(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Error al crear administrador');
    }
    setCreating(false);
  };

  const handleCreateReseller = async () => {
    setResellerError('');
    if (!newReseller.email || !newReseller.password || !newReseller.first_name || !newReseller.last_name) {
      setResellerError('Todos los campos son requeridos');
      return;
    }
    if (newReseller.password.length < 6) {
      setResellerError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    setCreatingReseller(true);
    try {
      await userService.createReseller(
        newReseller.email,
        newReseller.password,
        newReseller.first_name,
        newReseller.last_name,
        newReseller.company_name,
        newReseller.phone,
        newReseller.auto_approve
      );
      setNewReseller({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        company_name: '',
        phone: '',
        auto_approve: true,
      });
      setShowCreateReseller(false);
      await loadUsers();
    } catch (err: any) {
      setResellerError(err.message || 'Error al crear revendedor');
    }
    setCreatingReseller(false);
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Gestion de Usuarios</h1>
          <p className="text-gray-400">Administra revendedores, admins y permisos</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item}>
            <StatCard
              label="Total Revendedores"
              value={resellers.length}
              icon={<Users className="w-6 h-6 text-nexus-gold" />}
              subtext={`${resellers.filter((r) => r.approved && !r.blocked).length} activos`}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Administradores"
              value={admins.length}
              icon={<Shield className="w-6 h-6 text-nexus-accent" />}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Pendientes de Aprobacion"
              value={pendingApproval.length}
              icon={<UserCheck className="w-6 h-6 text-orange-400" />}
              subtext="Requieren revision"
            />
          </motion.div>
        </motion.div>

        {/* Create Admin */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Crear Administrador</h3>
              <Button
                variant={showCreateAdmin ? 'outline' : 'primary'}
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => { setShowCreateAdmin(!showCreateAdmin); setError(''); }}
              >
                {showCreateAdmin ? 'Cancelar' : 'Nuevo Admin'}
              </Button>
            </div>

            <AnimatePresence>
              {showCreateAdmin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/[0.05] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre"
                        placeholder="Juan"
                        value={newAdmin.first_name}
                        onChange={(e) => setNewAdmin((p) => ({ ...p, first_name: e.target.value }))}
                      />
                      <Input
                        label="Apellido"
                        placeholder="Perez"
                        value={newAdmin.last_name}
                        onChange={(e) => setNewAdmin((p) => ({ ...p, last_name: e.target.value }))}
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="admin@nexus.com"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                    />
                    <div className="relative">
                      <Input
                        label="Contrasena"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimo 6 caracteres"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    )}

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-200">
                        El nuevo administrador tendra acceso completo al panel de administracion.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleCreateAdmin}
                      loading={creating}
                      className="w-full"
                    >
                      Crear Administrador
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Create Reseller */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Crear Revendedor</h3>
              <Button
                variant={showCreateReseller ? 'outline' : 'primary'}
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => { setShowCreateReseller(!showCreateReseller); setResellerError(''); }}
              >
                {showCreateReseller ? 'Cancelar' : 'Nuevo Revendedor'}
              </Button>
            </div>

            <AnimatePresence>
              {showCreateReseller && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/[0.05] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre"
                        placeholder="Juan"
                        value={newReseller.first_name}
                        onChange={(e) => setNewReseller((p) => ({ ...p, first_name: e.target.value }))}
                      />
                      <Input
                        label="Apellido"
                        placeholder="Perez"
                        value={newReseller.last_name}
                        onChange={(e) => setNewReseller((p) => ({ ...p, last_name: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        placeholder="juan@example.com"
                        value={newReseller.email}
                        onChange={(e) => setNewReseller((p) => ({ ...p, email: e.target.value }))}
                      />
                      <Input
                        label="Telefono"
                        placeholder="+34 600 123 456"
                        value={newReseller.phone}
                        onChange={(e) => setNewReseller((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <Input
                      label="Empresa"
                      placeholder="Mi Empresa S.L."
                      value={newReseller.company_name}
                      onChange={(e) => setNewReseller((p) => ({ ...p, company_name: e.target.value }))}
                    />
                    <div className="relative">
                      <Input
                        label="Contrasena"
                        type={showResellerPassword ? 'text' : 'password'}
                        placeholder="Minimo 6 caracteres"
                        value={newReseller.password}
                        onChange={(e) => setNewReseller((p) => ({ ...p, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowResellerPassword(!showResellerPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white"
                      >
                        {showResellerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <input
                        type="checkbox"
                        checked={newReseller.auto_approve}
                        onChange={(e) => setNewReseller((p) => ({ ...p, auto_approve: e.target.checked }))}
                        className="w-4 h-4 rounded"
                      />
                      <label className="text-sm text-gray-300 flex-1">
                        Aprobar automáticamente la cuenta
                      </label>
                    </div>

                    {resellerError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-300">{resellerError}</p>
                      </div>
                    )}

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-200">
                        El revendedor podra crear pedidos y acceder a su panel de control.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleCreateReseller}
                      loading={creatingReseller}
                      className="w-full"
                    >
                      Crear Revendedor
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Pending Approvals */}
        {pendingApproval.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-400" />
                Aprobaciones Pendientes ({pendingApproval.length})
              </h3>
              <div className="space-y-3">
                {pendingApproval.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <div>
                      <p className="font-semibold text-white">{user.first_name} {user.last_name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      {user.company_name && <p className="text-xs text-gray-500 mt-1">{user.company_name}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<UserCheck className="w-4 h-4" />}
                        onClick={() => handleApprove(user.id)}
                        loading={actionLoading === user.id}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Lock className="w-4 h-4" />}
                        onClick={() => handleBlock(user.id)}
                        loading={actionLoading === user.id}
                      >
                        Bloquear
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* User List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Todos los Usuarios</h3>
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="max-w-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.1]">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Usuario</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Rol</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Nivel</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Ventas</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Estado</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-white">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.company_name && <p className="text-xs text-gray-600">{user.company_name}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          disabled={actionLoading === user.id || user.id === currentUser?.id}
                          className="bg-white/[0.05] text-white text-xs font-semibold rounded-lg px-2 py-1 border border-white/[0.1] focus:outline-none focus:border-nexus-gold"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r} className="bg-nexus-darker">{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {user.role === 'reseller' ? (
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${LEVEL_COLORS[user.level] || LEVEL_COLORS.basic}`}>
                            {LEVEL_LABELS[user.level] || user.level}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-white font-semibold">{user.sales_count || 0}</td>
                      <td className="py-3 px-4 text-center">
                        {!user.approved ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">Pendiente</span>
                        ) : user.blocked ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-300">Bloqueado</span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-300">Activo</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-1 justify-end">
                          {!user.approved && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(user.id)}
                              loading={actionLoading === user.id}
                              className="text-xs px-2 py-1"
                            >
                              <UserCheck className="w-3 h-3" />
                            </Button>
                          )}
                          {user.blocked ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblock(user.id)}
                              loading={actionLoading === user.id}
                              className="text-xs px-2 py-1"
                            >
                              <Unlock className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBlock(user.id)}
                              loading={actionLoading === user.id}
                              disabled={user.id === currentUser?.id}
                              className="text-xs px-2 py-1"
                            >
                              <Lock className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            loading={actionLoading === user.id}
                            disabled={user.id === currentUser?.id}
                            className="text-xs px-2 py-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron usuarios</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

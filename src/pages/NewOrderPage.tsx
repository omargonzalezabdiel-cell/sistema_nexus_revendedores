import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { Input, Button, GlassCard } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ChevronRight, ChevronLeft, X, FileText,
  Image, File, Phone, CalendarDays, Package, Palette,
  Ruler, Hash, MessageSquare, Truck, DollarSign, Send, CheckCircle
} from 'lucide-react';
import { costsService } from '../services/costsService';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  category: 'design' | 'reference';
}

const PRODUCT_TYPES = [
  'Playera Premium',
  'Playera Regular',
  'Sudadera',
  'Gorra',
  'Tote Bag',
  'Polo',
  'Short',
  'Hoodie',
  'Otro',
];

const SHIPPING_COSTS: Record<string, number> = {
  'uno-express': 8.50,
  'ferguson': 12.00,
};

export const NewOrderPage: React.FC = () => {
  const { user } = useAuth();
  const { addOrder, costs } = useData();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const designInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    province: '',
    address: '',
    phone: '',
    shipping_company: 'uno-express' as string,
    product_type: '',
    product_name: '',
    quantity: '',
    size: '',
    color: '',
    delivery_date: '',
    notes: '',
    payment_method: 'yappy' as string,
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState<'design' | 'reference' | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const simulateUpload = (file: File, category: 'design' | 'reference'): UploadedFile => {
    const uploadedFile: UploadedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      category,
    };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => prev.map(f =>
          f.id === uploadedFile.id ? { ...f, preview: e.target?.result as string } : f
        ));
      };
      reader.readAsDataURL(file);
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setFiles(prev => prev.map(f =>
        f.id === uploadedFile.id ? { ...f, progress: Math.min(progress, 100) } : f
      ));
    }, 200);

    return uploadedFile;
  };

  const processFiles = useCallback((newFiles: FileList | File[], category: 'design' | 'reference') => {
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;

    Array.from(newFiles).forEach(file => {
      if (!allowed.includes(file.type)) return;
      if (file.size > maxSize) return;

      const uploaded = simulateUpload(file, category);
      setFiles(prev => [...prev, uploaded]);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, category: 'design' | 'reference') => {
    e.preventDefault();
    setDragOver(null);
    processFiles(e.dataTransfer.files, category);
  }, [processFiles]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Auto-calculations using costs from DataContext
  const quantity = parseInt(formData.quantity) || 0;

  const pricing = costs ? costsService.calculateOrderPricing(
    quantity,
    SHIPPING_COSTS[formData.shipping_company] || costs.shipping_cost || 8.50,
    costs
  ) : null;

  const productionCost = pricing?.productionCost || 0;
  const shippingCost = pricing?.shippingCost || 0;
  const resellerProfit = pricing?.resellerProfit || 0;
  const nexusProfit = pricing?.nexusProfit || 0;
  const commission = pricing?.commission || 0;
  const totalPrice = pricing?.totalPrice || 0;
  const unitCost = pricing?.unitCost || 0;

  const designFiles = files.filter(f => f.category === 'design');
  const referenceFiles = files.filter(f => f.category === 'reference');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const order = await addOrder({
        reseller_id: user?.id || '',
        customer_name: formData.customer_name,
        province: formData.province,
        address: formData.address,
        phone: formData.phone,
        shipping_company: formData.shipping_company,
        product_type: formData.product_type,
        product_name: formData.product_type === 'Otro' ? formData.product_name : formData.product_type,
        quantity,
        size: formData.size,
        color: formData.color,
        notes: formData.notes,
        payment_method: formData.payment_method,
        shipping_cost: shippingCost,
        production_cost: productionCost,
        reseller_profit: resellerProfit,
        nexus_profit: nexusProfit,
        platform_commission: commission,
        total_price: totalPrice,
        status: 'pending',
        priority: 'normal',
        tracking_code: '',
        delivery_date: formData.delivery_date || null,
      });

      setCreatedOrderNumber(order.order_number);
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const orderId = createdOrderNumber || '';
    const productName = formData.product_type === 'Otro' ? formData.product_name : formData.product_type;
    const message = encodeURIComponent(
      `Hola, envio comprobante del pedido #${orderId}\n\nCliente: ${formData.customer_name}\nProducto: ${productName}\nCantidad: ${quantity}\nTotal: $${totalPrice.toFixed(2)}\nMetodo de pago: ${formData.payment_method === 'yappy' ? 'Yappy' : 'Transferencia Bancaria'}`
    );
    window.open(`https://wa.me/50764987682?text=${message}`, '_blank');
  };

  const resetForm = () => {
    setFormData({
      customer_name: '', province: '', address: '', phone: '',
      shipping_company: 'uno-express', product_type: '', product_name: '',
      quantity: '', size: '', color: '', delivery_date: '',
      notes: '', payment_method: 'yappy',
    });
    setFiles([]);
    setCreatedOrderNumber(null);
    setStep(1);
  };

  // Success screen
  if (createdOrderNumber) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard>
              <div className="text-center space-y-6 py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-white">Pedido Creado Exitosamente</h2>
                  <p className="text-nexus-gold font-mono text-lg mt-2">#{createdOrderNumber}</p>
                </div>

                <div className="space-y-2 text-left bg-white/[0.02] rounded-lg p-4 border border-white/[0.05]">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cliente</span>
                    <span className="text-white">{formData.customer_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Producto</span>
                    <span className="text-white">{formData.product_type === 'Otro' ? formData.product_name : formData.product_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cantidad</span>
                    <span className="text-white">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/[0.05] pt-2 mt-2">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-nexus-gold font-bold text-lg">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleWhatsApp}
                  >
                    Enviar Comprobante por WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={resetForm}
                  >
                    Crear Otro Pedido
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Crear Nuevo Pedido</h1>
          <p className="text-gray-400">Completa el formulario para registrar un nuevo pedido</p>
        </motion.div>

        <GlassCard>
          {/* Step indicators */}
          <div className="flex gap-2 mb-8">
            {[
              { num: 1, label: 'Cliente' },
              { num: 2, label: 'Producto' },
              { num: 3, label: 'Archivos' },
              { num: 4, label: 'Envio y Pago' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => { if (s.num < step) setStep(s.num); }}
                className={`flex-1 py-3 px-2 rounded-lg font-semibold transition-all text-sm ${
                  step === s.num
                    ? 'bg-nexus-gold text-black'
                    : step > s.num
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/[0.05] text-gray-500'
                }`}
              >
                <span className="block md:inline">{s.num}.</span> {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {/* STEP 1: Client Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-nexus-gold" />
                  Informacion del Cliente
                </h2>
                <Input
                  label="Nombre del Cliente"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Juan Garcia"
                  icon={<Hash className="w-4 h-4" />}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Provincia"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Panama"
                    required
                  />
                  <Input
                    label="Telefono"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+507 6498-7682"
                    icon={<Phone className="w-4 h-4" />}
                    required
                  />
                </div>
                <Input
                  label="Direccion de Entrega"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Calle Principal, Urbanizacion"
                  required
                />
              </motion.div>
            )}

            {/* STEP 2: Product Details */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-nexus-gold" />
                  Detalles del Producto
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Producto</label>
                  <select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-nexus-gold focus:ring-2 focus:ring-nexus-gold/20 transition-all"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {PRODUCT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {formData.product_type === 'Otro' && (
                  <Input
                    label="Especificar Producto"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    placeholder="Describir producto personalizado"
                    required
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="50"
                    icon={<Hash className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Talla"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="S, M, L, XL"
                    icon={<Ruler className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Negro"
                    icon={<Palette className="w-4 h-4" />}
                    required
                  />
                </div>

                <Input
                  label="Fecha de Entrega Deseada"
                  name="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  icon={<CalendarDays className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notas Especiales</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Instrucciones especiales, detalles adicionales del diseno, etc."
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:border-nexus-gold focus:ring-2 focus:ring-nexus-gold/20 transition-all"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: File Upload */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-nexus-gold" />
                  Archivos del Pedido
                </h2>

                {/* Design Upload */}
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-3">Subir Diseno</p>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver('design'); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, 'design')}
                    onClick={() => designInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                      transition-all duration-300
                      ${dragOver === 'design'
                        ? 'border-nexus-gold bg-nexus-gold/10'
                        : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <input
                      ref={designInputRef}
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.svg,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files && processFiles(e.target.files, 'design')}
                    />
                    <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver === 'design' ? 'text-nexus-gold' : 'text-gray-500'}`} />
                    <p className="text-gray-300 text-sm">Arrastra tu diseno aqui o haz clic para seleccionar</p>
                    <p className="text-gray-500 text-xs mt-2">PNG, JPG, SVG, PDF (max. 10MB)</p>
                  </div>

                  <AnimatePresence>
                    {designFiles.map(file => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-white/[0.05] flex items-center justify-center">
                              {file.type.includes('pdf') ? (
                                <FileText className="w-6 h-6 text-red-400" />
                              ) : (
                                <File className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            {file.progress < 100 && (
                              <div className="mt-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${file.progress}%` }}
                                  className="h-full bg-nexus-gold rounded-full"
                                />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Reference Upload */}
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-3">Subir Referencia</p>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver('reference'); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, 'reference')}
                    onClick={() => referenceInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                      transition-all duration-300
                      ${dragOver === 'reference'
                        ? 'border-nexus-accent bg-nexus-accent/10'
                        : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <input
                      ref={referenceInputRef}
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.svg,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files && processFiles(e.target.files, 'reference')}
                    />
                    <Image className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver === 'reference' ? 'text-nexus-accent' : 'text-gray-500'}`} />
                    <p className="text-gray-300 text-sm">Arrastra tu imagen de referencia aqui</p>
                    <p className="text-gray-500 text-xs mt-2">PNG, JPG, SVG, PDF (max. 10MB)</p>
                  </div>

                  <AnimatePresence>
                    {referenceFiles.map(file => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-white/[0.05] flex items-center justify-center">
                              {file.type.includes('pdf') ? (
                                <FileText className="w-6 h-6 text-red-400" />
                              ) : (
                                <File className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            {file.progress < 100 && (
                              <div className="mt-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${file.progress}%` }}
                                  className="h-full bg-nexus-accent rounded-full"
                                />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                  <p className="text-xs text-gray-400">
                    Los archivos son opcionales pero recomendados para agilizar el proceso de produccion.
                    Puedes subirlos despues desde la seccion de pedidos.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Shipping, Payment & Summary */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-nexus-gold" />
                  Envio, Pago y Resumen
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Empresa de Envio</label>
                    <select
                      name="shipping_company"
                      value={formData.shipping_company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-nexus-gold focus:ring-2 focus:ring-nexus-gold/20 transition-all"
                    >
                      <option value="uno-express">Uno Express</option>
                      <option value="ferguson">Ferguson</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Metodo de Pago</label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-nexus-gold focus:ring-2 focus:ring-nexus-gold/20 transition-all"
                    >
                      <option value="yappy">Yappy</option>
                      <option value="transfer">Transferencia Bancaria</option>
                    </select>
                  </div>
                </div>

                {/* Auto-calculation table */}
                <div className="bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-nexus-gold" />
                      Desglose de Precios (Auto-calculado)
                    </h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Costo de Produccion</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-medium">${productionCost.toFixed(2)}</span>
                        {quantity > 0 && costs && (
                          <span className="text-gray-500 text-xs ml-1">({quantity} x ${unitCost.toFixed(2)})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Costo de Envio ({formData.shipping_company === 'uno-express' ? 'Uno Express' : 'Ferguson'})</span>
                      </div>
                      <span className="text-white font-medium">${shippingCost.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-nexus-gold" />
                        <span className="text-nexus-gold text-sm font-medium">Tu Ganancia ({costs ? `${(costs.reseller_margin * 100).toFixed(0)}%` : '40%'})</span>
                      </div>
                      <span className="text-nexus-gold font-bold">${resellerProfit.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-nexus-accent" />
                        <span className="text-nexus-accent text-sm font-medium">Ganancia NEXUS ({costs ? `${(costs.nexus_margin * 100).toFixed(0)}%` : '30%'})</span>
                      </div>
                      <span className="text-nexus-accent font-bold">${nexusProfit.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Comision Plataforma ({costs ? `${(costs.platform_commission * 100).toFixed(0)}%` : '5%'})</span>
                      </div>
                      <span className="text-white font-medium">${commission.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-white font-bold text-lg">Total a Cobrar al Cliente</span>
                      <span className="text-2xl font-bold text-nexus-gold">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp comprobante note */}
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-200 font-medium">Comprobante por WhatsApp</p>
                      <p className="text-xs text-green-300/70 mt-1">
                        Despues de crear el pedido, podras enviar el comprobante automaticamente por WhatsApp al numero +507 6498-7682
                      </p>
                    </div>
                  </div>
                </div>

                {formData.delivery_date && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-200 font-medium">Fecha de Entrega Deseada</p>
                        <p className="text-xs text-blue-300/70 mt-1">
                          {new Date(formData.delivery_date).toLocaleDateString('es-PA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button variant="outline" size="lg" onClick={() => setStep(step - 1)} className="flex-1" icon={<ChevronLeft className="w-4 h-4" />}>
                Anterior
              </Button>
            )}
            {step < 4 ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep(step + 1)}
                className="flex-1"
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                loading={loading}
                className="flex-1"
                icon={<Send className="w-4 h-4" />}
              >
                Crear Pedido
              </Button>
            )}
          </div>
        </GlassCard>
      </div>
    </MainLayout>
  );
};

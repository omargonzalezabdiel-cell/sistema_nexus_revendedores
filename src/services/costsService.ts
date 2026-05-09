import { supabase } from '../lib/supabase';

export interface CostRow {
  id: string;
  material_cost: number;
  ink_cost: number;
  paper_cost: number;
  electricity_cost: number;
  labor_cost: number;
  packaging_cost: number;
  shipping_cost: number;
  maintenance_cost: number;
  platform_commission: number;
  reseller_margin: number;
  nexus_margin: number;
  updated_at: string;
}

export const costsService = {
  async getCosts() {
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as CostRow | null;
  },

  async updateCosts(updates: Partial<CostRow>, userId: string) {
    const { data, error } = await supabase
      .from('costs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', (await this.getCosts())?.id || '')
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as CostRow;
  },

  calculateOrderPricing(
    quantity: number,
    shippingCompanyCost: number,
    costs: CostRow
  ) {
    const unitCost =
      costs.material_cost +
      costs.ink_cost +
      costs.paper_cost +
      costs.electricity_cost +
      costs.labor_cost +
      costs.packaging_cost +
      costs.maintenance_cost;

    const productionCost = quantity * unitCost;
    const shippingCost = shippingCompanyCost;
    const basePrice = productionCost + shippingCost;
    const resellerProfit = basePrice * costs.reseller_margin;
    const nexusProfit = basePrice * costs.nexus_margin;
    const commission = basePrice * costs.platform_commission;
    const totalPrice = basePrice + resellerProfit + nexusProfit + commission;

    return {
      unitCost,
      productionCost,
      shippingCost,
      basePrice,
      resellerProfit,
      nexusProfit,
      commission,
      totalPrice,
    };
  },
};

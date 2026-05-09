import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const headers = {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };

    // Step 1: Delete old admin@nexus.com from auth.users
    const listUsersRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=admin@nexus.com`,
      { headers }
    );
    const listData = await listUsersRes.json();

    if (listData.users && listData.users.length > 0) {
      for (const u of listData.users) {
        await fetch(`${supabaseUrl}/auth/v1/admin/users/${u.id}`, {
          method: "DELETE",
          headers,
        });
      }
    }

    // Step 2: Delete from public.users table (cascade should handle it, but be safe)
    await fetch(`${supabaseUrl}/rest/v1/users?email=eq.admin@nexus.com`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=representation" },
    });

    // Step 3: Create new super_admin auth user
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: "alexanderyoir4106@gmail.com",
        password: "8189041122Omar4106@",
        email_confirm: true,
        user_metadata: {
          first_name: "Alexander",
          last_name: "Yoir",
          role: "super_admin",
        },
      }),
    });

    const userData = await createRes.json();

    if (!userData.id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to create auth user",
          error: userData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Insert profile into users table
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        auth_id: userData.id,
        email: "alexanderyoir4106@gmail.com",
        first_name: "Alexander",
        last_name: "Yoir",
        role: "super_admin",
        level: "distributor",
        xp: 9999,
        sales_count: 0,
        company_name: "NEXUS",
        approved: true,
        blocked: false,
      }),
    });

    const profileData = await insertRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Super admin created, old admin deleted",
        user: profileData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

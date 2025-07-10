// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AccountDeletionRequest {
  userId: string;
  reason?: string;
  timestamp?: number;
}

interface AccountDeletionResult {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

console.log("Account Deletion Edge Function initialized")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(`[EdgeFunction] Received ${req.method} request`)

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log(`[EdgeFunction] Method not allowed: ${req.method}`)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only POST requests are allowed'
          }
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('[EdgeFunction] Missing authorization header')
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing authorization header'
          }
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseServiceKey) {
      console.error('[EdgeFunction] Missing service role key')
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Server configuration error'
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create admin client for user operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create regular client to verify the user's JWT token
    const supabaseAnon = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Extract JWT token from authorization header
    const jwt = authHeader.replace('Bearer ', '')
    
    // Verify the user's JWT token and get user info
    console.log('[EdgeFunction] Verifying user JWT token')
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(jwt)
    
    if (authError || !user) {
      console.log('[EdgeFunction] Invalid JWT token:', authError?.message)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token'
          }
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[EdgeFunction] User authenticated: ${user.id}`)

    // Parse the request body
    let requestData: AccountDeletionRequest
    try {
      requestData = await req.json()
      console.log('[EdgeFunction] Request data:', requestData)
    } catch (error) {
      console.log('[EdgeFunction] Invalid JSON in request body:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid JSON in request body'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that the user ID in the request matches the authenticated user
    if (requestData.userId !== user.id) {
      console.log(`[EdgeFunction] User ID mismatch: ${requestData.userId} vs ${user.id}`)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot delete another user\'s account'
          }
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the deletion request for audit purposes
    console.log(`[EdgeFunction] Processing account deletion for user: ${user.id}`)
    
    // Delete the user using admin privileges
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error('[EdgeFunction] Failed to delete user:', deleteError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DELETION_FAILED',
            message: 'Failed to delete user account'
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[EdgeFunction] Successfully deleted user account: ${user.id}`)

    // Return success response
    const result: AccountDeletionResult = {
      success: true,
      message: 'Account successfully deleted'
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[EdgeFunction] Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* To test locally:

  1. Run `supabase start` to start local Supabase
  2. Make an HTTP request with valid JWT token:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-account' \
    --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
    --header 'Content-Type: application/json' \
    --data '{"userId":"user-id-here","timestamp":1234567890}'

*/
import type { APIRoute } from 'astro'

export const prerender = false

// List of all nejlepsi-etf category pages
const NEJLEPSI_ETF_PAGES = [
  '/nejlepsi-etf/nejlepsi-etf-2026',
  '/nejlepsi-etf/nejlepsi-dividendove-etf',
  '/nejlepsi-etf/nejlepsi-dluhopisove-etf',
  '/nejlepsi-etf/nejlepsi-komoditni-etf',
  '/nejlepsi-etf/nejlepsi-sp500-etf',
  '/nejlepsi-etf/nejlepsi-msci-world-etf',
  '/nejlepsi-etf/nejlepsi-technologicke-etf',
  '/nejlepsi-etf/nejlepsi-healthcare-etf',
  '/nejlepsi-etf/nejlepsi-emerging-markets-etf',
  '/nejlepsi-etf/nejlepsi-evropske-etf',
  '/nejlepsi-etf/nejlepsi-esg-etf',
  '/nejlepsi-etf/nejlepsi-americke-etf',
  '/nejlepsi-etf/nejlepsi-japonske-etf',
  '/nejlepsi-etf/nejlepsi-cinske-etf',
  '/nejlepsi-etf/nejlepsi-small-cap-etf',
  '/nejlepsi-etf/nejlepsi-value-etf',
  '/nejlepsi-etf/nejlepsi-growth-etf',
  '/nejlepsi-etf/nejlepsi-financni-etf',
  '/nejlepsi-etf/nejlepsi-energeticke-etf',
  '/nejlepsi-etf/etf-zdarma-degiro',
  '/nejlepsi-etf/nejlepsi-ai-etf',
  '/nejlepsi-etf/nejlepsi-asijsko-pacificke-etf',
  '/nejlepsi-etf/nejlepsi-biotechnologie-etf',
  '/nejlepsi-etf/nejlepsi-celosvetove-etf',
  '/nejlepsi-etf/nejlepsi-clean-energy-etf',
  '/nejlepsi-etf/nejlepsi-cloud-etf',
  '/nejlepsi-etf/nejlepsi-dax-etf',
  '/nejlepsi-etf/nejlepsi-defense-etf',
  '/nejlepsi-etf/nejlepsi-ftse100-etf',
  '/nejlepsi-etf/nejlepsi-kyberbezpecnost-etf',
  '/nejlepsi-etf/nejlepsi-nasdaq-etf',
  '/nejlepsi-etf/nejlepsi-nemovitostni-etf',
  '/nejlepsi-etf/nejlepsi-robotika-etf',
  '/nejlepsi-etf/nejlepsi-stoxx600-etf',
  '/nejlepsi-etf/nejlepsi-zlate-etf',
  '/nejlepsi-etf/nejlevnejsi-etf',
  '/nejlepsi-etf/nejlepsi-spotrebni-etf',
]

// Popular ETF comparison pages
const COMPARISON_PAGES = [
  '/srovnani-etf/vwce-vs-cspx',
  '/srovnani-etf/iwda-vs-cspx',
  '/srovnani-etf/vwce-vs-iwda',
  '/srovnani-etf/cspx-vs-vwra',
  '/srovnani-etf/cspx-vs-vuaa',
  '/srovnani-etf/swrd-vs-iwda',
  '/srovnani-etf/vwce-vs-vwrl',
  '/srovnani-etf/iwda-vs-vwra',
  '/srovnani-etf/cspx-vs-eunl',
  '/srovnani-etf/vwce-vs-eunl',
]

interface RevalidatePayload {
  secret: string
  type?: 'all' | 'core' | 'category' | 'comparison' | 'etf'
  isins?: string[]
  source?: string
  timestamp?: string
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: RevalidatePayload = await request.json()

    // Verify secret key
    const secret = body.secret
    const expectedSecret = import.meta.env.REVALIDATE_SECRET || 'etf_refresh_2025'

    if (secret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid secret' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const type = body.type || 'all'

    // For Astro static site, we need to trigger a rebuild
    // This can be done via:
    // 1. Vercel Deploy Hook (recommended for production)
    // 2. GitHub Actions workflow dispatch
    // 3. Manual rebuild trigger

    const vercelDeployHook = import.meta.env.VERCEL_DEPLOY_HOOK

    if (vercelDeployHook) {
      // Trigger Vercel rebuild
      const deployResponse = await fetch(vercelDeployHook, {
        method: 'POST',
      })

      if (deployResponse.ok) {
        console.log(`[Revalidate] Triggered Vercel rebuild via deploy hook`)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Build triggered successfully',
            type,
            method: 'vercel_deploy_hook',
            timestamp: new Date().toISOString(),
            source: body.source || 'unknown',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      } else {
        throw new Error(`Deploy hook failed: ${deployResponse.status}`)
      }
    }

    // If no deploy hook configured, just acknowledge the request
    // The site will be rebuilt on next deployment
    console.log(`[Revalidate] Webhook received from ${body.source || 'unknown'}`)
    console.log(`[Revalidate] Type: ${type}, Timestamp: ${body.timestamp}`)

    // Log what would be revalidated
    let pathsToRevalidate: string[] = []

    if (type === 'category' || type === 'all') {
      pathsToRevalidate.push(...NEJLEPSI_ETF_PAGES)
    }

    if (type === 'comparison' || type === 'all') {
      pathsToRevalidate.push(...COMPARISON_PAGES)
    }

    if (type === 'core' || type === 'all') {
      pathsToRevalidate.push('/', '/srovnani-etf', '/nejlepsi-etf', '/kde-koupit-etf')
    }

    if (type === 'etf' && body.isins && body.isins.length > 0) {
      pathsToRevalidate.push(...body.isins.map(isin => `/etf/${isin}`))
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook received. Site will be updated on next build.',
        type,
        pathCount: pathsToRevalidate.length,
        timestamp: new Date().toISOString(),
        source: body.source || 'unknown',
        note: 'Configure VERCEL_DEPLOY_HOOK env var to enable automatic rebuilds',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Revalidate] Error:', error)

    return new Response(
      JSON.stringify({
        error: 'Revalidation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// GET endpoint for testing
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  const expectedSecret = import.meta.env.REVALIDATE_SECRET || 'etf_refresh_2025'

  if (secret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: 'Invalid secret' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const hasDeployHook = !!import.meta.env.VERCEL_DEPLOY_HOOK

  return new Response(
    JSON.stringify({
      status: 'ok',
      availableTypes: ['all', 'core', 'category', 'comparison', 'etf'],
      categoryPagesCount: NEJLEPSI_ETF_PAGES.length,
      comparisonPagesCount: COMPARISON_PAGES.length,
      deployHookConfigured: hasDeployHook,
      usage: {
        all: 'POST with { secret, type: "all" } - Trigger full rebuild',
        core: 'POST with { secret, type: "core" } - Rebuild homepage, srovnani-etf, etc.',
        category: 'POST with { secret, type: "category" } - Rebuild all nejlepsi-etf pages',
        comparison: 'POST with { secret, type: "comparison" } - Rebuild comparison pages',
        etf: 'POST with { secret, type: "etf", isins: ["IE00B4L5Y983"] } - Rebuild specific ETF pages',
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

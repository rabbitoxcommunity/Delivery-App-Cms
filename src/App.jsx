import { useEffect, useState } from 'react'
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useLocation, useOutletContext } from 'react-router-dom'

import { css } from './lib/css'
import { useAuth } from './lib/auth'
import { useLiveOrders } from './lib/ordersData'
import { api, decodeTenantId, getAccessToken } from './lib/api'
import { useFetch } from './lib/useFetch'

import Header from './components/Header'
import InstallPrompt from './components/InstallPrompt'
import OrderDrawer from './components/OrderDrawer'
import Sidebar from './components/Sidebar'

import Login from './screens/Login'
import AddCategory from './screens/AddCategory'
import AddProduct from './screens/AddProduct'
import Categories from './screens/Categories'
import Credit from './screens/Credit'
import Customers from './screens/Customers'
import Insights from './screens/Insights'
import LiveOrders from './screens/LiveOrders'
import OrdersHistory from './screens/OrdersHistory'
import Products from './screens/Products'
import QuickStock from './screens/QuickStock'
import Settings from './screens/Settings'
import Staff from './screens/Staff'

function Splash() {
  return (
    <div style={css('min-height: 100vh; display: grid; place-items: center; background: #F6F7F5; color: #7B857F; font-size: 14.5px; font-weight: 700;')}>
      Loading…
    </div>
  )
}

/** Gate for every route under the Shell layout — unauthenticated visitors bounce to /login. */
function RequireAuth() {
  const { isSignedIn, isChecking } = useAuth()
  const location = useLocation()

  if (isChecking) return <Splash />
  if (!isSignedIn) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

/** /login — redirects away immediately if already signed in, and back to wherever RequireAuth redirected from on success. */
function LoginRoute() {
  const { isSignedIn, isChecking } = useAuth()
  const location = useLocation()

  if (isChecking) return <Splash />
  if (isSignedIn) return <Navigate to={location.state?.from?.pathname || '/live'} replace />
  return <Login />
}

/** Sidebar + Header + the live-orders data every nested route/drawer shares, via Outlet context. */
function Shell() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [selected, setSelected] = useState(null)
  const [navOpen, setNavOpen] = useState(false)

  const accessToken = getAccessToken()
  const tenantId = accessToken ? decodeTenantId(accessToken) : null
  const live = useLiveOrders({ tenantId, accessToken })

  // The sidebar drawer is a body-level state below 1100px.
  useEffect(() => {
    document.body.classList.toggle('fc-nav-open', navOpen)
    return () => document.body.classList.remove('fc-nav-open')
  }, [navOpen])

  // Sidebar badge counts — real numbers, refreshed on every navigation.
  const { data: attentionCount } = useFetch(async () => {
    const { items } = await api.get('/admin/products?limit=100')
    return items.reduce((n, p) => n + p.variants.filter((v) => v.stock !== 'available').length, 0)
  }, [location.pathname])
  const badges = {
    '/live': live.rows.length > 0 ? String(live.rows.length) : undefined,
    '/stock': attentionCount > 0 ? String(attentionCount) : undefined,
  }

  // The drawer's `selected` state lives here (shared with the sidebar-triggered
  // "customers arrived" banner too), not in the /live route — so navigating
  // to another screen while it's open must close it explicitly, or the
  // full-screen overlay stays stuck on top of whatever the user just clicked.
  useEffect(() => {
    setSelected(null)
  }, [location.pathname])

  const selectedOrder = live.rows.find((o) => o.id === selected) || null

  return (
    <>
      <div className="fc-shell" style={css('display: grid; grid-template-columns: 252px 1fr; min-height: 100vh; align-items: stretch;')}>
        <Sidebar onNavigate={() => setNavOpen(false)} user={user} onSignOut={signOut} badges={badges} />

        <main style={css('min-width: 0; display: flex; flex-direction: column;')}>
          <Header onOpenNav={() => setNavOpen(true)} />

          <div key={location.pathname} className="fc-content fc-fade-up" style={css('padding: 26px 30px 40px; display: flex; flex-direction: column; gap: 20px;')}>
            <Outlet context={{ live, openOrder: setSelected }} />
          </div>
        </main>
      </div>

      <div className="fc-scrim" onClick={() => setNavOpen(false)} />

      <OrderDrawer order={selectedOrder} onClose={() => setSelected(null)} onAdvance={live.advance} onCancel={live.cancel} />

      <InstallPrompt />
    </>
  )
}

/** /live — thin adapter: LiveOrders itself is a plain prop-driven component, live data comes from Shell via Outlet context. */
function LiveOrdersRoute() {
  const { live, openOrder } = useOutletContext()
  const [filter, setFilter] = useState('All')
  return (
    <LiveOrders
      orders={live.rows}
      loading={live.loading}
      error={live.error}
      onRetry={live.reload}
      filter={filter}
      onFilter={setFilter}
      onOpenOrder={openOrder}
      onAdvance={live.advance}
    />
  )
}

// `handle` carries each route's header title/subtitle — the single source of
// truth Header reads via useMatches(), instead of a second array of paths
// that has to be kept in sync with this tree by hand. useMatches() only
// exists on the "data router" API, which is why this is createBrowserRouter
// (config object tree) rather than the <Routes>/<Route> JSX form — mixing
// the two (a data-router-only hook under a plain <BrowserRouter>) throws
// "useMatches must be used within a data router" at render time.
const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginRoute /> },
    {
      element: <RequireAuth />,
      children: [
        {
          element: <Shell />,
          children: [
            { index: true, element: <Navigate to="/live" replace /> },
            {
              path: 'live',
              element: <LiveOrdersRoute />,
              handle: { title: 'Live Orders', subtitle: 'Orders coming in right now — keep this screen open' },
            },
            {
              path: 'insights',
              element: <Insights />,
              handle: { title: 'Insights', subtitle: 'How the shop is doing today and this month' },
            },
            { path: 'products', element: <Products />, handle: { title: 'Products', subtitle: 'English and Arabic names' } },
            {
              path: 'products/new',
              element: <AddProduct />,
              handle: { title: 'Add Product', subtitle: 'Fill in the details — it appears in the customer app once published' },
            },
            {
              path: 'products/:id/edit',
              element: <AddProduct />,
              handle: { title: 'Edit Product', subtitle: 'Changes are live as soon as you save' },
            },
            {
              path: 'categories',
              element: <Categories />,
              handle: { title: 'Categories', subtitle: 'How products are grouped in the customer app' },
            },
            {
              path: 'categories/new',
              element: <AddCategory />,
              handle: { title: 'Add Category', subtitle: 'Categories are the first thing customers see in the app' },
            },
            {
              path: 'stock',
              element: <QuickStock />,
              handle: { title: 'Quick Stock Update', subtitle: 'Flip availability in seconds — customers see it instantly' },
            },
            {
              path: 'customers',
              element: <Customers />,
              handle: { title: 'Customers', subtitle: 'Everyone who has signed up to order from you' },
            },
            {
              path: 'credit',
              element: <Credit />,
              handle: { title: 'Customer Credit', subtitle: 'Outstanding balances and payments' },
            },
            { path: 'orders', element: <OrdersHistory />, handle: { title: 'Orders', subtitle: 'Full order history' } },
            {
              path: 'staff',
              element: <Staff />,
              handle: { title: 'Delivery Staff', subtitle: 'Availability and active deliveries' },
            },
            {
              path: 'settings',
              element: <Settings />,
              handle: { title: 'Settings', subtitle: 'Shop, delivery, curbside, payments and language' },
            },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/live" replace /> },
  ],
  {
    future: { v7_startTransition: true, v7_relativeSplatPath: true },
  },
)

export default function App() {
  return <RouterProvider router={router} />
}

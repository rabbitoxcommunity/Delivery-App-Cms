import { useCallback, useEffect, useState } from 'react'

import { css } from './lib/css'
import { TITLES } from './lib/design'
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
import Insights from './screens/Insights'
import LiveOrders from './screens/LiveOrders'
import OrdersHistory from './screens/OrdersHistory'
import Products from './screens/Products'
import QuickStock from './screens/QuickStock'
import Settings from './screens/Settings'
import Staff from './screens/Staff'

// Manifest shortcuts deep-link with ?screen=…
function initialScreen() {
  const wanted = new URLSearchParams(window.location.search).get('screen')
  return wanted && Object.prototype.hasOwnProperty.call(TITLES, wanted) ? wanted : 'live'
}

function Splash() {
  return (
    <div style={css('min-height: 100vh; display: grid; place-items: center; background: #F6F7F5; color: #7B857F; font-size: 14.5px; font-weight: 700;')}>
      Loading…
    </div>
  )
}

function Shell() {
  const { user, signOut } = useAuth()
  const [screen, setScreen] = useState(initialScreen)
  const [liveFilter, setLiveFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState({})
  const [newState, setNewState] = useState('Available')
  const [navOpen, setNavOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)

  const accessToken = getAccessToken()
  const tenantId = accessToken ? decodeTenantId(accessToken) : null
  const live = useLiveOrders({ tenantId, accessToken })

  // Sidebar badge counts — real numbers, not the original design's static "12"/"7".
  const { data: attentionCount } = useFetch(async () => {
    const { items } = await api.get('/admin/products?limit=100')
    return items.reduce((n, p) => n + p.variants.filter((v) => v.stock !== 'available').length, 0)
  }, [screen])
  const badges = {
    live: live.rows.length > 0 ? String(live.rows.length) : undefined,
    stock: attentionCount > 0 ? String(attentionCount) : undefined,
  }

  // The sidebar drawer is a body-level state below 1100px.
  useEffect(() => {
    document.body.classList.toggle('fc-nav-open', navOpen)
    return () => document.body.classList.remove('fc-nav-open')
  }, [navOpen])

  const go = useCallback((next) => {
    setScreen(next)
    setSelected(null)
    setNavOpen(false)
  }, [])

  const goAddProduct = useCallback((productId) => {
    setEditingProductId(productId ?? null)
    setScreen('add')
  }, [])

  // Nav highlights the parent section while an "add" sub-screen is showing.
  const current = screen === 'add' ? 'products' : screen === 'addcat' ? 'categories' : screen
  const selectedOrder = live.rows.find((o) => o.id === selected) || null

  return (
    <>
      <div className="fc-shell" style={css('display: grid; grid-template-columns: 252px 1fr; min-height: 100vh; align-items: stretch;')}>
        <Sidebar current={current} onNavigate={go} user={user} onSignOut={signOut} badges={badges} />

        <main style={css('min-width: 0; display: flex; flex-direction: column;')}>
          <Header screen={screen} onOpenNav={() => setNavOpen(true)} />

          <div className="fc-content" style={css('padding: 26px 30px 40px; display: flex; flex-direction: column; gap: 20px;')}>
            {screen === 'live' && (
              <LiveOrders
                orders={live.rows}
                loading={live.loading}
                error={live.error}
                onRetry={live.reload}
                filter={liveFilter}
                onFilter={setLiveFilter}
                onOpenOrder={setSelected}
                onAdvance={live.advance}
              />
            )}
            {screen === 'insights' && <Insights />}
            {screen === 'products' && (
              <Products
                open={open}
                onToggle={(id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))}
                onGoAdd={() => goAddProduct(null)}
                onEdit={(id) => goAddProduct(id)}
              />
            )}
            {screen === 'categories' && <Categories onGoAddCat={() => go('addcat')} />}
            {screen === 'addcat' && <AddCategory onBack={() => go('categories')} />}
            {screen === 'add' && (
              <AddProduct
                productId={editingProductId}
                newState={newState}
                onNewState={setNewState}
                onBack={() => go('products')}
              />
            )}
            {screen === 'stock' && <QuickStock />}
            {screen === 'credit' && <Credit />}
            {screen === 'orders' && <OrdersHistory />}
            {screen === 'staff' && <Staff />}
            {screen === 'settings' && <Settings />}
          </div>
        </main>
      </div>

      <div className="fc-scrim" onClick={() => setNavOpen(false)} />

      <OrderDrawer order={selectedOrder} onClose={() => setSelected(null)} onAdvance={live.advance} onCancel={live.cancel} />

      <InstallPrompt />
    </>
  )
}

export default function App() {
  const { isChecking, isSignedIn } = useAuth()

  if (isChecking) return <Splash />
  if (!isSignedIn) return <Login />
  return <Shell />
}

import { useCallback, useEffect, useState } from 'react'

import { css } from './lib/css'
import { TITLES } from './lib/design'
import { SEED_ORDERS, SEED_STOCK } from './lib/data'
import { advanceStatus } from './lib/orders'

import Header from './components/Header'
import InstallPrompt from './components/InstallPrompt'
import OrderDrawer from './components/OrderDrawer'
import Sidebar from './components/Sidebar'

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

export default function App() {
  const [screen, setScreen] = useState(initialScreen)
  const [liveFilter, setLiveFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState({})
  const [newState, setNewState] = useState('Available')
  const [stock, setStock] = useState(SEED_STOCK)
  const [orders, setOrders] = useState(SEED_ORDERS)
  const [navOpen, setNavOpen] = useState(false)

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

  const advance = useCallback((id) => setOrders((prev) => advanceStatus(prev, id)), [])

  // Nav highlights the parent section while an "add" sub-screen is showing.
  const current = screen === 'add' ? 'products' : screen === 'addcat' ? 'categories' : screen
  const selectedOrder = orders.find((o) => o.id === selected) || null

  return (
    <>
      <div className="fc-shell" style={css('display: grid; grid-template-columns: 252px 1fr; min-height: 100vh; align-items: stretch;')}>
        <Sidebar current={current} onNavigate={go} />

        <main style={css('min-width: 0; display: flex; flex-direction: column;')}>
          <Header screen={screen} onOpenNav={() => setNavOpen(true)} />

          <div className="fc-content" style={css('padding: 26px 30px 40px; display: flex; flex-direction: column; gap: 20px;')}>
            {screen === 'live' && (
              <LiveOrders
                orders={orders}
                filter={liveFilter}
                onFilter={setLiveFilter}
                onOpenOrder={setSelected}
                onAdvance={advance}
              />
            )}
            {screen === 'insights' && <Insights onGoStock={() => go('stock')} />}
            {screen === 'products' && (
              <Products
                open={open}
                onToggle={(id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))}
                onGoAdd={() => go('add')}
              />
            )}
            {screen === 'categories' && <Categories onGoAddCat={() => go('addcat')} />}
            {screen === 'addcat' && <AddCategory onBack={() => go('categories')} />}
            {screen === 'add' && (
              <AddProduct newState={newState} onNewState={setNewState} onBack={() => go('products')} />
            )}
            {screen === 'stock' && (
              <QuickStock
                stock={stock}
                onSetStock={(id, v) => setStock((prev) => ({ ...prev, [id]: v }))}
              />
            )}
            {screen === 'credit' && <Credit />}
            {screen === 'orders' && <OrdersHistory />}
            {screen === 'staff' && <Staff />}
            {screen === 'settings' && <Settings />}
          </div>
        </main>
      </div>

      <div className="fc-scrim" onClick={() => setNavOpen(false)} />

      <OrderDrawer order={selectedOrder} onClose={() => setSelected(null)} onAdvance={advance} />

      <InstallPrompt />
    </>
  )
}

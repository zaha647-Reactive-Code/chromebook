'use client';
import { useStore } from '@/components/StoreProvider';
import { CartLineRow, EmptyState } from '@/components/CartBits';
import { Back, Card, Shield } from '@/components/Icons';
import { money } from '@/lib/format';

export default function CartView() {
  const { cartItems, cartCount, subtotal, delivery, total, clearCart, hasProblems, ready } = useStore();

  return (
    <>
      <header className="pg-hero">
        <span className="hero-kicker">Your selection</span>
        <h1>Shopping <span className="accent">cart</span></h1>
        <div className="steps">
          <span className="on"><i>1</i>Cart</span><span><i>2</i>Details</span><span><i>3</i>Payment</span>
        </div>
      </header>
      <main className="pg">
        {!ready ? null : !cartItems.length ? (
          <div className="panel"><EmptyState title="Your cart is empty" text="Nothing here yet. Browse our Chromebooks and accessories and add what you like." href="/shop" button="Go to shop" /></div>
        ) : (
          <div className="pg-grid">
            <div>
              <div className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
                  <h3>{cartCount + (cartCount === 1 ? ' item' : ' items')}</h3>
                  <button type="button" className="li-rm" style={{ fontSize: 12.5 }} onClick={() => { if (confirm('Remove everything from your cart?')) clearCart(); }}>Clear cart</button>
                </div>
                {hasProblems && <div className="au-msg err" style={{ display: 'block' }}>Some items changed since you added them. Please check the notes below before checking out.</div>}
                {cartItems.map((l) => <CartLineRow key={l.id} id={l.id} />)}
              </div>
              <a className="btn btn-metal" href="/shop" style={{ marginTop: 22 }}>← Continue shopping</a>
            </div>
            <aside className="sticky">
              <div className="panel">
                <h3>Order summary</h3>
                <p className="sub">Delivery is free across Pakistan.</p>
                <div className="sum-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
                <div className="sum-row"><span>Delivery</span>{delivery ? <b>{money(delivery)}</b> : <span className="sum-free">Free</span>}</div>
                <div className="sum-row tot"><span>Total</span><span>{money(total)}</span></div>
                {hasProblems
                  ? <span className="btn btn-metal sum-btn" aria-disabled="true">Fix the items above to continue</span>
                  : <a className="btn btn-rose sum-btn" href="/checkout">Proceed to checkout <span className="arrow-c">↗</span></a>}
                <div className="trust">
                  <div><Shield />Genuine devices with official warranty</div>
                  <div><Back />7-day money-back guarantee</div>
                  <div><Card />Pay by bank transfer, confirmed on WhatsApp</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

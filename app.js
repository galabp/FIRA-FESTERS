// Carta de Festers Joves Ròtova. Preus llegits de les imatges enviades.
// El combo "Cervesa i tapa" costa 3 €.
const PRODUCTS = [
  { id: 1, name: "Cervesa i tapa", description: "Combo", price: 3.00, category: "Combos", emoji: "🍺" },
  { id: 2, name: "Cervesa", description: "Beguda", price: 1.50, category: "Begudes", emoji: "🍺" },
  { id: 3, name: "Refresc", description: "Beguda", price: 1.50, category: "Begudes", emoji: "🥤" },
  { id: 4, name: "Aigua menuda", description: "Beguda", price: 1.50, category: "Begudes", emoji: "💧" },
  { id: 5, name: "Aigua gran", description: "Beguda", price: 2.50, category: "Begudes", emoji: "💧" },
  { id: 6, name: "Tinto d’estiu", description: "Beguda", price: 2.00, category: "Begudes", emoji: "🍷" },
  { id: 7, name: "Café", description: "Café sol", price: 1.00, category: "Cafés", emoji: "☕" },
  { id: 8, name: "Café amb llet", description: "Café", price: 1.50, category: "Cafés", emoji: "☕" },
  { id: 9, name: "Café tallat", description: "Café", price: 1.20, category: "Cafés", emoji: "☕" },
  { id: 10, name: "Café bombó", description: "Café", price: 1.50, category: "Cafés", emoji: "☕" },
  { id: 11, name: "Truita", description: "Tapa", price: 2.50, category: "Tapes", emoji: "🍳" },
  { id: 12, name: "Sang en ceba", description: "Tapa", price: 3.00, category: "Tapes", emoji: "🍲" },
  { id: 13, name: "Hojaldre de pernil dolç i formatge", description: "Tapa", price: 2.50, category: "Tapes", emoji: "🥐" },
  { id: 14, name: "Coca dolça", description: "Tapa", price: 2.00, category: "Tapes", emoji: "🥧" },
  { id: 15, name: "Olives", description: "Tapa", price: 1.00, category: "Tapes", emoji: "🫒" },
  { id: 16, name: "Papes", description: "Tapa", price: 1.00, category: "Tapes", emoji: "🥔" }
];
const STORAGE_KEY = "festers-joves-rotova-vendes-v1";
let cart = [], activeFilter = "Tots", sales = loadSales();
const money = n => new Intl.NumberFormat("ca-ES",{style:"currency",currency:"EUR"}).format(n);
const byId = id => document.getElementById(id);
function loadSales(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return []}}
function saveSales(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sales))}catch{alert("No s’han pogut guardar les dades. Exporta les vendes sovint.")}}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function renderProducts(){
 const items=PRODUCTS.filter(p=>activeFilter==="Tots"||p.category===activeFilter);
 byId("products").innerHTML=items.map(p=>`<button class="product" data-product="${p.id}"><span class="emoji">${p.emoji}</span><span class="pname">${escapeHtml(p.name)}</span><span class="desc">${escapeHtml(p.description)}</span><span class="price">${money(p.price)}</span></button>`).join("");
 document.querySelectorAll("[data-product]").forEach(b=>b.addEventListener("click",()=>addProduct(Number(b.dataset.product))));
}
function addProduct(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;const old=cart.find(x=>x.id===id);if(old)old.qty++;else cart.push({...p,qty:1});renderCart()}
function changeQty(id,n){const x=cart.find(p=>p.id===id);if(!x)return;x.qty+=n;if(x.qty<=0)cart=cart.filter(p=>p.id!==id);renderCart()}
function totalCart(){return cart.reduce((s,p)=>s+p.price*p.qty,0)}
function renderCart(){
 const count=cart.reduce((s,p)=>s+p.qty,0);byId("item-count").textContent=`${count} ${count===1?"article":"articles"}`;byId("cart-total").textContent=money(totalCart());byId("go-pay").disabled=!cart.length;
 if(!cart.length)byId("cart-items").innerHTML='<div class="empty">Encara no hi ha cap article.<br>Tria un producte per començar.</div>';
 else{byId("cart-items").innerHTML=cart.map(p=>`<div class="cart-row"><div><div class="itemname">${escapeHtml(p.emoji)} ${escapeHtml(p.name)}</div><div class="itemsub">${money(p.price)} × ${p.qty} = ${money(p.price*p.qty)}</div></div><div class="qty"><button data-minus="${p.id}" aria-label="Llevar una unitat">−</button><strong>${p.qty}</strong><button data-plus="${p.id}" aria-label="Afegir una unitat">+</button></div></div>`).join("");
 document.querySelectorAll("[data-minus]").forEach(b=>b.addEventListener("click",()=>changeQty(+b.dataset.minus,-1)));document.querySelectorAll("[data-plus]").forEach(b=>b.addEventListener("click",()=>changeQty(+b.dataset.plus,1)))}
 updateCash();
}
function updateCash(){const total=totalCart(),raw=byId("cash-received").value,received=Number(raw),valid=cart.length>0&&raw!==""&&Number.isFinite(received)&&received>=total;byId("finish-sale").disabled=!valid;
 if(raw===""){byId("change-due").textContent="—";byId("change-label").textContent="Canvi a tornar"}else if(received<total){byId("change-due").textContent=money(total-received);byId("change-label").textContent="Falta per cobrar"}else{byId("change-due").textContent=money(received-total);byId("change-label").textContent="Canvi a tornar"}}
function clearCart(){cart=[];byId("cash-received").value="";renderCart()}
function finishSale(){const total=totalCart(),received=Number(byId("cash-received").value);if(!cart.length||!Number.isFinite(received)||received<total)return;
 const sale={id:Date.now(),date:new Date().toISOString(),items:cart.map(({id,name,price,qty})=>({id,name,price,qty})),total:+total.toFixed(2),received:+received.toFixed(2),change:+(received-total).toFixed(2),method:"Efectiu"};sales.unshift(sale);saveSales();
 byId("receipt-description").textContent=`Venda #${String(sale.id).slice(-6)} · ${sale.items.reduce((n,p)=>n+p.qty,0)} articles`;byId("receipt-total").textContent=money(sale.total);byId("receipt-change").textContent=money(sale.change);byId("receipt-modal").classList.add("show");clearCart();renderSummary()}
function renderSummary(){byId("sales-count").textContent=sales.length;byId("sales-total").textContent=money(sales.reduce((s,x)=>s+x.total,0));if(!sales.length){byId("history").innerHTML='<div class="empty">Encara no hi ha vendes tancades.</div>';return}
 byId("history").innerHTML=sales.slice(0,8).map(s=>{const d=new Date(s.date).toLocaleString("ca-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});return `<div class="historyrow"><div><strong>${d}</strong><small>${s.items.map(p=>`${p.qty}× ${escapeHtml(p.name)}`).join(", ")}</small></div><strong>${money(s.total)}</strong></div>`}).join("")}
function exportCSV(){if(!sales.length){alert("Encara no hi ha vendes per a exportar.");return}const rows=[["Venda","Data","Producte","Quantitat","Preu unitari","Subtotal","Total venda","Diners rebuts","Canvi","Mètode"]];sales.forEach(s=>s.items.forEach(p=>rows.push([s.id,new Date(s.date).toLocaleString("ca-ES"),p.name,p.qty,p.price.toFixed(2),(p.price*p.qty).toFixed(2),s.total.toFixed(2),s.received.toFixed(2),s.change.toFixed(2),s.method])));const csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download=`vendes-festers-joves-rotova-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
byId("filters").querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;byId("filters").querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===b));renderProducts()}));
byId("clear-cart").addEventListener("click",clearCart);byId("cancel-sale").addEventListener("click",clearCart);byId("cash-received").addEventListener("input",updateCash);
document.querySelectorAll("[data-cash]").forEach(b=>b.addEventListener("click",()=>{byId("cash-received").value=(b.dataset.cash==="exact"?totalCart():Number(b.dataset.cash)).toFixed(2);updateCash()}));
byId("go-pay").addEventListener("click",()=>{byId("cash-received").scrollIntoView({behavior:"smooth",block:"center"});byId("cash-received").focus({preventScroll:true})});
byId("finish-sale").addEventListener("click",finishSale);byId("export-sales").addEventListener("click",exportCSV);
byId("close-receipt").addEventListener("click",()=>byId("receipt-modal").classList.remove("show"));byId("new-sale").addEventListener("click",()=>byId("receipt-modal").classList.remove("show"));byId("receipt-modal").addEventListener("click",e=>{if(e.target===byId("receipt-modal"))byId("receipt-modal").classList.remove("show")});
renderProducts();renderCart();renderSummary();
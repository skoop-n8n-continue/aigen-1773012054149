// ====================================================
// DESIGN DECISION: Single Product "Object Worship"
// ====================================================
const PRODUCTS_PER_CYCLE = 2;

let PRODUCTS = [];
let currentBatch = 0;

async function loadProducts() {
  try {
    const response = await fetch('./products.json', { cache: 'no-store' });
    const data = await response.json();
    PRODUCTS = data.products || [];
  } catch (error) {
    console.error('Failed to load products.json:', error);
    // Fallback Mock Data for testing if fetch fails
    PRODUCTS = [
      {
        "brand": "Anthologie",
        "name": "Citradelic Sunset | 3.5g",
        "price": "50",
        "discounted_price": 20,
        "image_url": "https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fundefined-1773010741032.png",
        "strain": "Citradelic Sunset"
      }
    ];
  }
  
  if (PRODUCTS.length > 0) {
    startCycle();
  } else {
    console.error("No products available.");
  }
}

function getBatch(batchIndex) {
  const start = (batchIndex * PRODUCTS_PER_CYCLE) % PRODUCTS.length;
  const batch = [];
  for (let i = 0; i < PRODUCTS_PER_CYCLE; i++) {
    batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
  }
  return batch;
}

function renderBatch(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  products.forEach((product, index) => {
    const productEl = document.createElement('div');
    productEl.className = 'product';
    
    const strainHtml = product.strain && product.strain.trim() !== "" ? 
        `<div class="strain-badge">${product.strain}</div>` : '';

    const priceHtml = product.discounted_price && product.discounted_price < parseFloat(product.price) ?
        `<div class="pricing">
            <div class="original-price">$${product.price}</div>
            <div class="discount-wrapper">
                <div class="discount-price">$${product.discounted_price}</div>
                <div class="discount-label">Special Price</div>
            </div>
         </div>` : 
         `<div class="pricing"><div class="discount-price">$${product.price}</div></div>`;

    productEl.innerHTML = `
      <div class="product-image-container">
        <img class="product-image" src="${product.image_url}" alt="${product.name}">
      </div>
      <div class="product-info">
        <div class="brand-name">${product.brand || 'Premium'}</div>
        <h2 class="product-name">${product.name}</h2>
        ${strainHtml}
        ${priceHtml}
      </div>
    `;

    container.appendChild(productEl);
  });
}

function animateCycle(batchIndex) {
  const batch = getBatch(batchIndex);
  renderBatch(batch);

  const tl = gsap.timeline({
    onComplete: () => animateCycle(batchIndex + 1)
  });

  // Background slow zoom loop
  gsap.to("#background", {
    scale: 1.05,
    duration: 10,
    ease: "sine.inOut",
    yoyo: true,
    repeat: 1
  });

  // Setup splits
  const brandName = new SplitText(".brand-name", { type: "chars" });
  const productName = new SplitText(".product-name", { type: "words,chars" });

  // Initial states
  gsap.set(".product-image", { y: 100, opacity: 0, scale: 0.9, rotationY: -15 });
  gsap.set(brandName.chars, { opacity: 0, y: 20 });
  gsap.set(productName.chars, { opacity: 0, x: -20 });
  gsap.set(".strain-badge", { opacity: 0, scale: 0.8 });
  gsap.set(".original-price", { opacity: 0, x: -20 });
  gsap.set(".discount-wrapper", { opacity: 0, y: 30 });
  gsap.set("#the-x", { opacity: 0, scale: 0.5, rotation: -20 });
  gsap.set("#glow-overlay", { opacity: 0 });

  // Entrance
  tl.to(".product-image", {
    y: 0,
    opacity: 1,
    scale: 1,
    rotationY: 0,
    duration: 2.5,
    ease: "power3.out"
  }, 0.2);

  tl.to("#glow-overlay", {
    opacity: 1,
    duration: 2,
    ease: "power2.inOut"
  }, 0.5);

  tl.to(brandName.chars, {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.05,
    ease: "power2.out"
  }, 1);

  tl.to(productName.chars, {
    opacity: 1,
    x: 0,
    duration: 1,
    stagger: 0.02,
    ease: "back.out(1.5)"
  }, 1.2);

  if(document.querySelector(".strain-badge")) {
    tl.to(".strain-badge", {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out"
    }, 1.8);
  }

  tl.to(".original-price", {
    opacity: 0.5, // Keeps it dim
    x: 0,
    duration: 0.8,
    ease: "power2.out"
  }, 2);

  tl.to(".discount-wrapper", {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "elastic.out(1, 0.5)"
  }, 2.4);

  // Living Moment (Subtle Floating)
  tl.to(".product-image", {
    y: -15,
    rotationY: 5,
    duration: 3,
    ease: "sine.inOut",
    yoyo: true,
    repeat: 1
  }, 2.5);

  // The X Sweeps in as a transition warning
  tl.to("#the-x", {
    opacity: 0.15,
    scale: 1.2,
    rotation: 0,
    duration: 4,
    ease: "power1.inOut"
  }, 4);

  // Exit
  tl.to(".product-info > *", {
    opacity: 0,
    x: 30,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.in"
  }, 7);

  tl.to(".product-image", {
    opacity: 0,
    scale: 1.1,
    y: -50,
    duration: 1.2,
    ease: "power3.in"
  }, 7.2);

  tl.to("#the-x", {
    opacity: 0,
    scale: 1.5,
    duration: 1.5,
    ease: "power2.in"
  }, 7.5);

  tl.to("#glow-overlay", {
    opacity: 0,
    duration: 1.5
  }, 7.5);

  // Total duration roughly 9 seconds per cycle
}

function startCycle() {
  animateCycle(0);
}

window.addEventListener('DOMContentLoaded', loadProducts);
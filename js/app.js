// File: /js/app.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
    });
  }
  
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `<h3>${product.name}</h3>
                      <p>${product.price}</p>
                      <p>${product.description}</p>`;
    return card;
  }
  
  document.getElementById('fetchDataBtn').addEventListener('click', () => {
    fetch('/data.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '';
        data.products.forEach(product => {
          catalog.appendChild(createProductCard(product));
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  });
  
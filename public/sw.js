const CACHE_NAME = 'lista-inteligente-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Os assets do Vite terão hashes, então o cache dinâmico cuidará deles.
  // Adicione aqui os ícones quando eles forem criados.
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Evento de instalação: abre o cache e armazena os arquivos principais.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: serve os arquivos do cache se disponíveis, senão, busca na rede.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se o recurso estiver no cache, retorna ele.
        if (response) {
          return response;
        }

        // Senão, busca na rede.
        return fetch(event.request).then(
          (response) => {
            // Verifica se recebemos uma resposta válida.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta. Uma resposta é um stream e só pode ser consumida uma vez.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Evento de ativação: limpa caches antigos.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
